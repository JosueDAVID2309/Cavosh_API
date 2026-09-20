process.env.NODE_ENV = 'test';
require('dotenv').config();

const { sequelize } = require('../src/models');
const seedDatabase = require('../src/utils/seed');
const app = require('../src/app');
const request = require('supertest');

beforeAll(async () => {
  await sequelize.sync({ force: true });
  await seedDatabase();
});

afterAll(async () => {
  await sequelize.close();
});

describe('Productos', () => {
  test('GET /api/productos -> 200 y array', async () => {
    const res = await request(app).get('/api/productos');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('GET /api/productos?categoria=Hot drinks -> 200 y 5 items', async () => {
    const res = await request(app).get('/api/productos').query({ categoria: 'Hot drinks' });
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(5);
  });

  test('GET /api/productos/nuevos -> 200 y 4 items', async () => {
    const res = await request(app).get('/api/productos/nuevos');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(4);
  });

  test('GET /api/productos/frecuentes -> 200 y 4 items', async () => {
    const res = await request(app).get('/api/productos/frecuentes');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(4);
  });

  test('GET /api/productos/buscar?q=latte -> 200', async () => {
    const res = await request(app).get('/api/productos/buscar').query({ q: 'latte' });
    expect(res.status).toBe(200);
  });

  test('GET /api/productos/1 -> 200 y Caramel Macchiato', async () => {
    const res = await request(app).get('/api/productos/1');
    expect(res.status).toBe(200);
    expect(res.body.data.nombre).toBe('Caramel Macchiato');
  });
});

describe('Sucursales', () => {
  test('GET /api/sucursales -> 200 y 2 items', async () => {
    const res = await request(app).get('/api/sucursales');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
  });

  test('GET /api/sucursales/ciudad?ciudad=Lima -> 200 y 2 items', async () => {
    const res = await request(app).get('/api/sucursales/ciudad').query({ ciudad: 'Lima' });
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
  });

  test('GET /api/sucursales/1 -> 200', async () => {
    const res = await request(app).get('/api/sucursales/1');
    expect(res.status).toBe(200);
  });
});

describe('Auth', () => {
  test('POST /api/auth/login -> 200 con credenciales correctas', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'usuario@cavosh.com', password: '123456' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('POST /api/auth/login (wrong pass) -> 400', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'usuario@cavosh.com', password: 'wrong' });
    expect(res.status).toBe(400);
  });

  test('GET /api/auth/perfil/1 -> 200 y email correcto', async () => {
    const res = await request(app).get('/api/auth/perfil/1');
    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe('usuario@cavosh.com');
  });

  test('PUT /api/auth/perfil/1/preferencias -> 200', async () => {
    const res = await request(app)
      .put('/api/auth/perfil/1/preferencias')
      .query({ notificaciones: 'false', ubicacion: 'false' });
    expect(res.status).toBe(200);
  });
});

describe('Favoritos', () => {
  test('GET /api/favoritos/1 -> 200 y 4 items', async () => {
    const res = await request(app).get('/api/favoritos/1');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(4);
  });

  test('GET /api/favoritos/check (is fav) -> 200 y true', async () => {
    const res = await request(app).get('/api/favoritos/check').query({ idUsuario: 1, idProducto: 1 });
    expect(res.status).toBe(200);
    expect(res.body.data).toBe(true);
  });

  test('GET /api/favoritos/check (not fav) -> 200 y false', async () => {
    const res = await request(app).get('/api/favoritos/check').query({ idUsuario: 1, idProducto: 9 });
    expect(res.status).toBe(200);
    expect(res.body.data).toBe(false);
  });
});

describe('Carrito', () => {
  test('POST /api/carrito -> 200', async () => {
    const res = await request(app)
      .post('/api/carrito')
      .send({ idUsuario: 1, idProducto: 1, cantidad: 2, tamano: 'Large' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('GET /api/carrito/1 -> 200 y 1 item', async () => {
    const res = await request(app).get('/api/carrito/1');
    expect(res.status).toBe(200);
    expect(res.body.data.items).toHaveLength(1);
  });
});

describe('Cupones', () => {
  test('POST /api/cupones/validar (valid) -> 200 y valido=true', async () => {
    const res = await request(app)
      .post('/api/cupones/validar')
      .send({ codigo: 'CAVOSH10', subtotal: 10.00 });
    expect(res.status).toBe(200);
    expect(res.body.data.valido).toBe(true);
  });

  test('POST /api/cupones/validar (invalid) -> 200 y valido=false', async () => {
    const res = await request(app)
      .post('/api/cupones/validar')
      .send({ codigo: 'INVALID', subtotal: 10.00 });
    expect(res.status).toBe(200);
    expect(res.body.data.valido).toBe(false);
  });
});

describe('Pedidos', () => {
  let orderNum;

  test('POST /api/pedidos -> 200 y numeroPedido', async () => {
    const res = await request(app)
      .post('/api/pedidos')
      .send({ idUsuario: 1, idSucursal: 1, codigoCupon: 'CAVOSH10' });
    expect(res.status).toBe(200);
    expect(res.body.data.numeroPedido).toBeDefined();
    orderNum = res.body.data.numeroPedido;
  });

  test('GET /api/pedidos/tracking/:num -> 200', async () => {
    const res = await request(app).get(`/api/pedidos/tracking/${orderNum}`);
    expect(res.status).toBe(200);
  });

  test('GET /api/pedidos/usuario/1 -> 200 y >= 1 item', async () => {
    const res = await request(app).get('/api/pedidos/usuario/1');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  test('GET /api/pedidos/1 -> 200', async () => {
    const res = await request(app).get('/api/pedidos/1');
    expect(res.status).toBe(200);
  });
});
