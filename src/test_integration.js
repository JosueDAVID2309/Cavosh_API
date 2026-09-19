process.env.NODE_ENV = 'test';
const { sequelize } = require('./models');
const seedDatabase = require('./utils/seed');
const app = require('./app');

async function runTests() {
  await sequelize.sync({ force: true });
  await seedDatabase();

  const server = app.listen(9099, async () => {
    const base = 'http://localhost:9099/api';
    let passed = 0;
    let failed = 0;

    function log(test, ok, detail) {
      if (ok) { passed += 1; console.log(`  \u2713 ${test}`); }
      else { failed += 1; console.log(`  \u2717 ${test} ${detail || ''}`); }
    }

    async function request(path, opts = {}) {
      const res = await globalThis.fetch(path, opts);
      const text = await res.text();
      let data = null;
      try { data = JSON.parse(text); } catch (e) { data = { raw: text }; }
      return { status: res.status, data };
    }

    try {
      // --- Productos ---
      let r = await request(`${base}/productos`);
      log('GET /api/productos -> ' + r.status, r.status === 200 && Array.isArray(r.data.data), r.data);

      r = await request(`${base}/productos?categoria=Hot%20drinks`);
      log('GET /api/productos?categoria=Hot drinks -> ' + r.status, r.status === 200 && r.data.data.length === 5, r.data);

      r = await request(`${base}/productos/nuevos`);
      log('GET /api/productos/nuevos -> ' + r.status, r.status === 200 && r.data.data.length === 4, r.data);

      r = await request(`${base}/productos/frecuentes`);
      log('GET /api/productos/frecuentes -> ' + r.status, r.status === 200 && r.data.data.length === 4, r.data);

      r = await request(`${base}/productos/buscar?q=latte`);
      log('GET /api/productos/buscar?q=latte -> ' + r.status, r.status === 200, r.data);

      r = await request(`${base}/productos/1`);
      log('GET /api/productos/1 -> ' + r.status, r.status === 200 && r.data.data.nombre === 'Caramel Macchiato', r.data);

      // --- Sucursales ---
      r = await request(`${base}/sucursales`);
      log('GET /api/sucursales -> ' + r.status, r.status === 200 && r.data.data.length === 2, r.data);

      r = await request(`${base}/sucursales/ciudad?ciudad=Lima`);
      log('GET /api/sucursales/ciudad?ciudad=Lima -> ' + r.status, r.status === 200 && r.data.data.length === 2, r.data);

      r = await request(`${base}/sucursales/1`);
      log('GET /api/sucursales/1 -> ' + r.status, r.status === 200, r.data);

      // --- Auth ---
      r = await request(`${base}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'usuario@cavosh.com', password: '123456' }),
      });
      log('POST /api/auth/login -> ' + r.status, r.status === 200 && r.data.success === true, r.data);

      r = await request(`${base}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'usuario@cavosh.com', password: 'wrong' }),
      });
      log('POST /api/auth/login (wrong pass) -> ' + r.status, r.status === 400, r.data);

      r = await request(`${base}/auth/perfil/1`);
      log('GET /api/auth/perfil/1 -> ' + r.status, r.status === 200 && r.data.data.email === 'usuario@cavosh.com', r.data);

      r = await request(`${base}/auth/perfil/1/preferencias?notificaciones=false&ubicacion=false`, { method: 'PUT' });
      log('PUT /api/auth/perfil/1/preferencias -> ' + r.status, r.status === 200, r.data);

      // --- Favoritos ---
      r = await request(`${base}/favoritos/1`);
      log('GET /api/favoritos/1 -> ' + r.status, r.status === 200 && r.data.data.length === 4, r.data);

      r = await request(`${base}/favoritos/check?idUsuario=1&idProducto=1`);
      log('GET /api/favoritos/check (is fav) -> ' + r.status, r.status === 200 && r.data.data === true, r.data);

      r = await request(`${base}/favoritos/check?idUsuario=1&idProducto=9`);
      log('GET /api/favoritos/check (not fav) -> ' + r.status, r.status === 200 && r.data.data === false, r.data);

      // --- Carrito ---
      r = await request(`${base}/carrito`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idUsuario: 1, idProducto: 1, cantidad: 2, tamano: 'Large' }),
      });
      log('POST /api/carrito -> ' + r.status, r.status === 200 && r.data.success, r.data);

      r = await request(`${base}/carrito/1`);
      log('GET /api/carrito/1 -> ' + r.status, r.status === 200 && r.data.data.items.length === 1, r.data);

      // --- Cupones ---
      r = await request(`${base}/cupones/validar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo: 'CAVOSH10', subtotal: 10.00 }),
      });
      log('POST /api/cupones/validar (valid) -> ' + r.status, r.status === 200 && r.data.data.valido === true, r.data);

      r = await request(`${base}/cupones/validar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo: 'INVALID', subtotal: 10.00 }),
      });
      log('POST /api/cupones/validar (invalid) -> ' + r.status, r.status === 200 && r.data.data.valido === false, r.data);

      // --- Pedidos ---
      r = await request(`${base}/pedidos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idUsuario: 1, idSucursal: 1, codigoCupon: 'CAVOSH10' }),
      });
      log('POST /api/pedidos -> ' + r.status, r.status === 200 && r.data.data.numeroPedido, r.data);

      const orderNum = r.data.data.numeroPedido;
      r = await request(`${base}/pedidos/tracking/${orderNum}`);
      log('GET /api/pedidos/tracking/:num -> ' + r.status, r.status === 200, r.data);

      r = await request(`${base}/pedidos/usuario/1`);
      log('GET /api/pedidos/usuario/1 -> ' + r.status, r.status === 200 && r.data.data.length >= 1, r.data);

      r = await request(`${base}/pedidos/1`);
      log('GET /api/pedidos/1 -> ' + r.status, r.status === 200, r.data);

      server.close();
      const summary = `  ====================================\n  Resultados: ${passed} passed, ${failed} failed\n  ====================================\n`;
      console.log(summary);
      process.exit(failed > 0 ? 1 : 0);
    } catch (e) {
      console.error('[TEST ERROR]', e);
      server.close();
      process.exit(1);
    }
  });
}

runTests().catch((e) => {
  console.error('[FATAL]', e.message);
  process.exit(1);
});
