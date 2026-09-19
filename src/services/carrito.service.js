const { Carrito, Usuario, Producto } = require('../models');
const CarritoResumenResponse = require('../dtos/CarritoResumenResponse');
const BadRequestException = require('../exceptions/BadRequestException');
const ResourceNotFoundException = require('../exceptions/ResourceNotFoundException');
const { round2, add } = require('../utils/decimal');

class CarritoService {
  async agregar(req) {
    const { idUsuario, idProducto, cantidad, tamano, tipoLeche, conCrema, conCafeina, precioUnitario } = req;

    if (idUsuario === null || idUsuario === undefined || idProducto === null || idProducto === undefined) {
      throw new BadRequestException('ID de usuario y de producto son requeridos');
    }

    const usuario = await Usuario.findByPk(idUsuario);
    if (!usuario) {
      throw new ResourceNotFoundException('Usuario no encontrado');
    }

    const producto = await Producto.findByPk(idProducto);
    if (!producto) {
      throw new ResourceNotFoundException('Producto no encontrado');
    }

    const qty = (cantidad !== null && cantidad !== undefined && cantidad > 0) ? cantidad : 1;
    const size = (tamano !== null && tamano !== undefined && tamano !== '') ? tamano : 'Small';
    const milk = (tipoLeche !== null && tipoLeche !== undefined && tipoLeche !== '') ? tipoLeche : 'Full-fat milk';
    const cream = (conCrema !== null && conCrema !== undefined && conCrema !== '') ? conCrema : 'Without whipped cream';
    const caffeine = (conCafeina !== null && conCafeina !== undefined && conCafeina !== '') ? conCafeina : 'With caffeine';

    let extraSize = 0;
    const sizeLower = String(size).toLowerCase();
    if (sizeLower === 'medium') {
      extraSize = 0.50;
    } else if (sizeLower === 'large') {
      extraSize = 1.00;
    }

    let extraMilk = 0;
    const milkLower = String(milk).toLowerCase();
    if (milkLower.includes('almond') || milkLower.includes('oat') || milkLower.includes('almendra') || milkLower.includes('avena')) {
      extraMilk = 0.70;
    }

    let extraCream = 0;
    const creamLower = String(cream).toLowerCase();
    if ((creamLower.includes('with') && !creamLower.includes('without')) || creamLower.includes('con crema')) {
      extraCream = 0.50;
    }

    const precioBase = Number(producto.precio);
    let unitPrice;
    if (precioUnitario !== null && precioUnitario !== undefined && Number(precioUnitario) > 0) {
      unitPrice = Number(precioUnitario);
    } else {
      unitPrice = round2(precioBase + extraSize + extraMilk + extraCream);
    }

    const subtotal = round2(unitPrice * qty);

    const item = await Carrito.create({
      idUsuario,
      idProducto,
      cantidad: qty,
      tamano: size,
      tipoLeche: milk,
      conCrema: cream,
      conCafeina: caffeine,
      precioUnitario: unitPrice,
      subtotal,
    });

    return Carrito.findByPk(item.idCarrito, {
      include: [
        { model: Usuario, as: 'usuario' },
        { model: Producto, as: 'producto' },
      ],
    });
  }

  async obtenerResumen(idUsuario) {
    const items = await Carrito.findAll({
      where: { idUsuario },
      include: [
        { model: Usuario, as: 'usuario' },
        { model: Producto, as: 'producto' },
      ],
      order: [['fechaAgregado', 'DESC']],
    });

    let totalArticulos = 0;
    let subtotal = 0;

    items.forEach((item) => {
      totalArticulos += item.cantidad;
      subtotal = add(subtotal, item.subtotal);
    });

    const subtotalRounded = round2(subtotal);
    const totalRounded = round2(subtotal);

    return CarritoResumenResponse({
      items,
      totalArticulos,
      subtotal: subtotalRounded,
      descuento: 0,
      total: totalRounded,
      codigoCupon: null,
    });
  }

  async actualizarCantidad(idCarrito, idUsuario, nuevaCantidad) {
    const item = await Carrito.findOne({
      where: { idCarrito, idUsuario },
    });

    if (!item) {
      throw new ResourceNotFoundException('Item de carrito no encontrado');
    }

    if (nuevaCantidad <= 0) {
      await item.destroy();
      return null;
    }

    item.cantidad = nuevaCantidad;
    item.subtotal = round2(Number(item.precioUnitario) * nuevaCantidad);
    await item.save();

    return Carrito.findByPk(item.idCarrito, {
      include: [
        { model: Usuario, as: 'usuario' },
        { model: Producto, as: 'producto' },
      ],
    });
  }

  async eliminar(idCarrito, idUsuario) {
    const item = await Carrito.findOne({
      where: { idCarrito, idUsuario },
    });

    if (!item) {
      throw new ResourceNotFoundException('Item de carrito no encontrado');
    }

    await item.destroy();
  }

  async vaciar(idUsuario) {
    await Carrito.destroy({ where: { idUsuario } });
  }
}

module.exports = new CarritoService();
