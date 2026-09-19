require('dotenv').config();
const { sequelize } = require('./models');
const seedDatabase = require('./utils/seed');
const app = require('./app');

async function verifyResponses() {
  await sequelize.sync({ force: true });
  await seedDatabase();

  const server = app.listen(9101, async () => {
    const base = 'http://localhost:9101/api';

    async function fetch(path, opts = {}) {
      const res = await globalThis.fetch(path, opts);
      const text = await res.text();
      return JSON.parse(text);
    }

    // 1. Add item to carrito
    await fetch(`${base}/carrito`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idUsuario: 1, idProducto: 1, cantidad: 1 }),
    });

    let r = await fetch(`${base}/carrito/1`);
    const item0 = JSON.parse(JSON.stringify(r.data.items[0]));
    console.log('=== Carrito item ===');
    console.log('  usuario.password excluded?', !('password' in item0.usuario));
    console.log('  producto.nombre:', item0.producto.nombre);
    console.log('  precioUnitario:', item0.precioUnitario, '(expected 4.00 for Small)');
    console.log('  subtotal:', item0.subtotal);

    // 2. Verificar cálculo con size extras (Large = +$1.00)
    await fetch(`${base}/carrito/vaciar/1`, { method: 'DELETE' });
    await fetch(`${base}/carrito`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idUsuario: 1, idProducto: 2, cantidad: 1, tamano: 'Large' }),
    });
    r = await fetch(`${base}/carrito/1`);
    const item2 = JSON.parse(JSON.stringify(r.data.items[0]));
    console.log('\n=== Large Vanilla Latte ===');
    console.log('  precioUnitario:', item2.precioUnitario, '(expected 4.00 = 3.00 + 1.00)');
    console.log('  subtotal:', item2.subtotal);

    // 3. Verificar Pedido con nested objects
    r = await fetch(`${base}/pedidos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idUsuario: 1, idSucursal: 1, codigoCupon: 'WELCOME' }),
    });
    const pedido = JSON.parse(JSON.stringify(r.data));
    console.log('\n=== Pedido response ===');
    console.log('  numeroPedido:', pedido.numeroPedido);
    console.log('  usuario.password excluded?', !('password' in pedido.usuario));
    console.log('  sucursal.nombre:', pedido.sucursal.nombre);
    console.log('  detalles count:', pedido.detalles.length);
    console.log('  detalle[0].producto.nombre:', pedido.detalles[0].producto.nombre);
    console.log('  subtotal:', pedido.subtotal, 'descuento:', pedido.descuento, 'total:', pedido.total);

    // 4. Verificar cupón percentage discount (CAVOSH10 = 10% off, min $5.00)
    r = await fetch(`${base}/cupones/validar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codigo: 'CAVOSH10', subtotal: 10.00 }),
    });
    console.log('\n=== Cupón CAVOSH10 (10% off $10.00, min $5.00) ===');
    console.log('  valido:', r.data.valido);
    console.log('  descuento:', r.data.descuento, '(expected 1.00)');
    console.log('  nuevoTotal:', r.data.nuevoTotal, '(expected 9.00)');

    // 5. Verificar toggle favorite
    r = await fetch(`${base}/favoritos/check?idUsuario=1&idProducto=2`);
    console.log('\n=== Favorito check (product 2) ===');
    console.log('  isFavorito:', r.data, '(expected false)');

    r = await fetch(`${base}/favoritos/toggle?idUsuario=1&idProducto=2`, { method: 'POST' });
    console.log('  toggle result:', r.data, '(expected true)');

    r = await fetch(`${base}/favoritos/check?idUsuario=1&idProducto=2`);
    console.log('  isFavorito after toggle:', r.data, '(expected true)');

    r = await fetch(`${base}/favoritos/toggle?idUsuario=1&idProducto=2`, { method: 'POST' });
    console.log('  toggle again:', r.data, '(expected false)');

    // 6. Verificar registrar
    r = await fetch(`${base}/auth/registrar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombreCompleto: 'Test User', email: 'test@cavosh.com', password: 'pass123' }),
    });
    console.log('\n=== Register ===');
    console.log('  success:', r.success);
    console.log('  message:', r.message);
    console.log('  idUsuario:', r.data.idUsuario);
    console.log('  email:', r.data.email);
    console.log('  puntos:', r.data.puntos, '(expected 124)');
    console.log('  password excluded?', !('password' in r.data));

    console.log('\n=== All verifications completed ===');
    server.close();
    process.exit(0);
  });
}

verifyResponses().catch((e) => {
  console.error('[ERROR]', e);
  process.exit(1);
});
