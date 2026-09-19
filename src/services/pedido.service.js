const {
  Pedido, DetallePedido, Carrito, Usuario, Sucursal, Producto, sequelize,
} = require('../models');
const cuponService = require('./cupon.service');
const BadRequestException = require('../exceptions/BadRequestException');
const ResourceNotFoundException = require('../exceptions/ResourceNotFoundException');
const { round2, add } = require('../utils/decimal');

class PedidoService {
  async crearPedido(req) {
    const {
      idUsuario, idSucursal, metodoEntrega, fechaEntrega, horaEntrega,
      metodoPago, tarjetaUltimos4, codigoCupon,
    } = req;

    if (idUsuario === null || idUsuario === undefined || idSucursal === null || idSucursal === undefined) {
      throw new BadRequestException('Usuario y sucursal son requeridos');
    }

    const usuario = await Usuario.findByPk(idUsuario);
    if (!usuario) {
      throw new ResourceNotFoundException('Usuario no encontrado');
    }

    const sucursal = await Sucursal.findByPk(idSucursal);
    if (!sucursal) {
      throw new ResourceNotFoundException('Sucursal no encontrada');
    }

    const itemsCarrito = await Carrito.findAll({
      where: { idUsuario },
      include: [{ model: Producto, as: 'producto' }],
    });

    if (itemsCarrito.length === 0) {
      throw new BadRequestException('El carrito está vacío, no se puede generar el pedido');
    }

    let subtotal = 0;
    itemsCarrito.forEach((item) => {
      subtotal = add(subtotal, item.subtotal);
    });
    subtotal = round2(subtotal);

    let descuento = 0;
    if (codigoCupon && codigoCupon.trim() !== '') {
      const cuponRes = await cuponService.validarCupon({ codigo: codigoCupon, subtotal });
      if (cuponRes.valido) {
        descuento = Number(cuponRes.descuento);
      }
    }

    let total = round2(subtotal - descuento);
    if (total < 0) {
      total = 0;
    }

    const numeroPedido = await this._generarNumeroPedido();

    const t = await sequelize.transaction();

    try {
      const pedido = await Pedido.create({
        idUsuario,
        idSucursal,
        numeroPedido,
        metodoEntrega: metodoEntrega || 'PICKUP',
        fechaEntrega: fechaEntrega || new Date().toISOString().split('T')[0],
        horaEntrega: horaEntrega || '08:00 AM',
        metodoPago: metodoPago || 'CARD',
        tarjetaUltimos4: tarjetaUltimos4 || '2048',
        subtotal: round2(subtotal),
        descuento: round2(descuento),
        total,
        codigoCupon: codigoCupon || null,
        estado: 'PLACED',
      }, { transaction: t });

      const detallesData = itemsCarrito.map((item) => ({
        idPedido: pedido.idPedido,
        idProducto: item.idProducto,
        cantidad: item.cantidad,
        tamano: item.tamano,
        tipoLeche: item.tipoLeche,
        conCrema: item.conCrema,
        conCafeina: item.conCafeina,
        precioUnitario: item.precioUnitario,
        subtotal: item.subtotal,
      }));

      await DetallePedido.bulkCreate(detallesData, { transaction: t });

      await Carrito.destroy({ where: { idUsuario }, transaction: t });

      usuario.puntos = usuario.puntos + 10;
      await usuario.save({ transaction: t });

      await t.commit();

      return Pedido.findByPk(pedido.idPedido, {
        include: [
          { model: Usuario, as: 'usuario' },
          { model: Sucursal, as: 'sucursal' },
          { model: DetallePedido, as: 'detalles', include: [{ model: Producto, as: 'producto' }] },
        ],
      });
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }

  async obtenerPorId(idPedido) {
    const pedido = await Pedido.findByPk(idPedido, {
      include: [
        { model: Usuario, as: 'usuario' },
        { model: Sucursal, as: 'sucursal' },
        { model: DetallePedido, as: 'detalles', include: [{ model: Producto, as: 'producto' }] },
      ],
    });

    if (!pedido) {
      throw new ResourceNotFoundException(`Pedido no encontrado con ID: ${idPedido}`);
    }

    return pedido;
  }

  async obtenerPorNumero(numeroPedido) {
    const pedido = await Pedido.findOne({
      where: { numeroPedido },
      include: [
        { model: Usuario, as: 'usuario' },
        { model: Sucursal, as: 'sucursal' },
        { model: DetallePedido, as: 'detalles', include: [{ model: Producto, as: 'producto' }] },
      ],
    });

    if (!pedido) {
      throw new ResourceNotFoundException(`Pedido no encontrado: ${numeroPedido}`);
    }

    return pedido;
  }

  async listarPorUsuario(idUsuario) {
    const pedidos = await Pedido.findAll({
      where: { idUsuario },
      include: [
        { model: Usuario, as: 'usuario' },
        { model: Sucursal, as: 'sucursal' },
        { model: DetallePedido, as: 'detalles', include: [{ model: Producto, as: 'producto' }] },
      ],
      order: [['fechaCreacion', 'DESC']],
    });
    return pedidos;
  }

  async _generarNumeroPedido() {
    const min = 10;
    const max = 99;
    const attempt = () => String(Math.floor(Math.random() * (max - min + 1)) + min);

    let numero = attempt();
    let exists = await Pedido.findOne({ where: { numeroPedido: numero } });
    while (exists) {
      numero = attempt();
      exists = await Pedido.findOne({ where: { numeroPedido: numero } });
    }
    return numero;
  }
}

module.exports = new PedidoService();
