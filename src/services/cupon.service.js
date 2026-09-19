const { Cupon } = require('../models');
const CuponResponse = require('../dtos/CuponResponse');
const { round2, sub, mul, div, gt, lt, gte } = require('../utils/decimal');

class CuponService {
  async validarCupon(request) {
    const { codigo, subtotal: subtotalReq } = request;

    if (!codigo || codigo.trim() === '') {
      return CuponResponse({
        valido: false,
        codigo: '',
        descuento: 0,
        nuevoTotal: subtotalReq !== null && subtotalReq !== undefined ? Number(subtotalReq) : 0,
        mensaje: 'Código promocional inválido',
      });
    }

    const subtotal = (subtotalReq !== null && subtotalReq !== undefined) ? Number(subtotalReq) : 0;
    const codigoLimpio = codigo.trim().toUpperCase();

    const cupon = await Cupon.findOne({
      where: {
        codigo: codigoLimpio,
        activo: true,
      },
    });

    if (!cupon) {
      return CuponResponse({
        valido: false,
        codigo: codigoLimpio,
        descuento: 0,
        nuevoTotal: subtotal,
        mensaje: 'Cupón no encontrado o inactivo',
      });
    }

    if (cupon.fechaExpiracion) {
      const today = new Date().toISOString().split('T')[0];
      if (cupon.fechaExpiracion < today) {
        return CuponResponse({
          valido: false,
          codigo: codigoLimpio,
          descuento: 0,
          nuevoTotal: subtotal,
          mensaje: 'El cupón ha expirado',
        });
      }
    }

    if (lt(subtotal, cupon.compraMinima)) {
      return CuponResponse({
        valido: false,
        codigo: codigoLimpio,
        descuento: 0,
        nuevoTotal: subtotal,
        mensaje: `Compra mínima requerida: S/${cupon.compraMinima}`,
      });
    }

    let descuento = 0;
    if (gte(Number(cupon.porcentajeDescuento), 0.01)) {
      descuento = div(mul(subtotal, cupon.porcentajeDescuento), 100);
    } else if (gte(Number(cupon.montoFijo), 0.01)) {
      descuento = Number(cupon.montoFijo);
    }

    if (descuento > 0) {
      descuento = round2(descuento);
    }

    if (gt(descuento, subtotal)) {
      descuento = subtotal;
    }

    const nuevoTotal = round2(sub(subtotal, descuento));

    return CuponResponse({
      valido: true,
      codigo: codigoLimpio,
      descuento: round2(descuento),
      nuevoTotal,
      mensaje: '¡Cupón aplicado con éxito!',
    });
  }
}

module.exports = new CuponService();
