function CarritoResumenResponse(data) {
  return {
    items: data.items,
    totalArticulos: data.totalArticulos,
    subtotal: data.subtotal,
    descuento: data.descuento,
    total: data.total,
    codigoCupon: data.codigoCupon,
  };
}

module.exports = CarritoResumenResponse;
