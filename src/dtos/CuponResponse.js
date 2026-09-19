function CuponResponse(data) {
  return {
    valido: data.valido,
    codigo: data.codigo,
    descuento: data.descuento,
    nuevoTotal: data.nuevoTotal,
    mensaje: data.mensaje,
  };
}

module.exports = CuponResponse;
