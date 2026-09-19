const { Usuario, Sucursal, Producto, Cupon, MetodoPago, Favorito } = require('../models');

async function seedDatabase() {
  const usuarioCount = await Usuario.count();

  if (usuarioCount === 0) {
    const user = await Usuario.create({
      nombreCompleto: 'Laura Vat',
      email: 'usuario@cavosh.com',
      password: '123456',
      puntos: 124,
      telefono: '+51 987 654 321',
      avatarUrl: '',
      recibirNotificaciones: true,
      compartirUbicacion: true,
    });

    await Sucursal.bulkCreate([
      {
        nombre: 'Cavosh Cafe - Central',
        direccion: 'Av. Javier Prado Este 1230',
        ciudad: 'Lima',
        horarioAtencion: 'Open: 8:00 AM - 22:00 PM',
        latitud: -12.0891,
        longitud: -77.0234,
        imagenUrl: '',
        activa: true,
      },
      {
        nombre: 'Cavosh Cafe - Miraflores',
        direccion: 'Av. José Larco 450',
        ciudad: 'Lima',
        horarioAtencion: 'Open: 8:00 AM - 22:00 PM',
        latitud: -12.1211,
        longitud: -77.0298,
        imagenUrl: '',
        activa: true,
      },
    ]);

    await Producto.bulkCreate([
      { nombre: 'Caramel Macchiato', descripcion: 'Our Caramel Macchiato is the perfect combination of a rich-tasting espresso, creamy milk and the sweet, buttery aroma of caramel.', precio: 4.00, categoria: 'Hot drinks', esNuevo: true, esFrecuente: true, tamanoMl: 250 },
      { nombre: 'Vanilla Latte', descripcion: 'Rich, full-bodied espresso blended with creamy steamed milk and lightly sweetened with vanilla syrup.', precio: 3.00, categoria: 'Hot drinks', esNuevo: true, esFrecuente: false, tamanoMl: 250 },
      { nombre: 'White Chocolate Mocha', descripcion: 'Espresso, steamed milk and decadent white chocolate sauce topped with sweetened whipped cream.', precio: 4.00, categoria: 'Hot drinks', esNuevo: true, esFrecuente: false, tamanoMl: 300 },
      { nombre: 'Traditional Cappuccino', descripcion: 'Dark, rich espresso lies in wait under a smoothed and stretched layer of thick milk foam.', precio: 3.00, categoria: 'Hot drinks', esNuevo: false, esFrecuente: true, tamanoMl: 250 },
      { nombre: 'Caffe Mocha', descripcion: 'Rich espresso combined with bittersweet chocolate sauce and steamed milk.', precio: 4.50, categoria: 'Hot drinks', esNuevo: false, esFrecuente: true, tamanoMl: 300 },
      { nombre: 'Cinnamon Roll', descripcion: 'Warm, freshly baked pastry swirled with cinnamon brown sugar and topped with cream cheese icing.', precio: 3.50, categoria: 'Bakery', esNuevo: false, esFrecuente: true, tamanoMl: 0 },
      { nombre: 'Iced Caramel Macchiato', descripcion: 'Espresso poured over chilled milk, flavored with sweet vanilla syrup and drizzled with caramel sauce.', precio: 4.50, categoria: 'Cold drinks', esNuevo: true, esFrecuente: false, tamanoMl: 350 },
      { nombre: 'Cold Brew Coffee', descripcion: 'Slow-steeped in cool water for 20 hours for a super smooth, full-bodied coffee taste without acidity.', precio: 3.80, categoria: 'Cold drinks', esNuevo: false, esFrecuente: false, tamanoMl: 350 },
      { nombre: 'Croissant Clásico', descripcion: 'Flaky, buttery all-butter French croissant baked fresh daily.', precio: 2.80, categoria: 'Bakery', esNuevo: false, esFrecuente: false, tamanoMl: 0 },
    ]);

    await Cupon.bulkCreate([
      { codigo: 'CAVOSH10', porcentajeDescuento: 10.00, montoFijo: 0.00, compraMinima: 5.00, activo: true, fechaExpiracion: '2027-12-31' },
      { codigo: 'WELCOME', porcentajeDescuento: 0.00, montoFijo: 1.20, compraMinima: 5.00, activo: true, fechaExpiracion: '2027-12-31' },
    ]);

    await MetodoPago.bulkCreate([
      { idUsuario: user.idUsuario, tipoTarjeta: 'MasterCard', ultimosCuatro: '2048', titular: 'Laura Vat', esPredeterminada: true },
      { idUsuario: user.idUsuario, tipoTarjeta: 'Visa', ultimosCuatro: '1234', titular: 'Laura Vat', esPredeterminada: false },
    ]);

    await Favorito.bulkCreate([
      { idUsuario: user.idUsuario, idProducto: 1 },
      { idUsuario: user.idUsuario, idProducto: 4 },
      { idUsuario: user.idUsuario, idProducto: 5 },
      { idUsuario: user.idUsuario, idProducto: 6 },
    ]);

    console.log('[SEED] Datos iniciales de Cavosh Cafe listos y verificados.');
  } else {
    console.log('[SEED] La base de datos ya contiene datos. Saltando inicialización.');
  }
}

module.exports = seedDatabase;
