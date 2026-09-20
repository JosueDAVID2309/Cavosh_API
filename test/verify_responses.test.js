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

describe('Verificaciones de respuestas', () => {
  test('Carrito item: password excluido, precioUnitario Small 4.00', async () => {
    await request(app)
      .post('/api/carrito')
      .send({ idUsuario: 1, idProducto: 1, cantidad: 1 });

    const res = await request(app).get('/api/carrito/1');
    const item = res.body.data.items[0];

    expect('password' in item.usuario).toBe(false);
    expect(item.producto.nombre).toBe('Caramel Macchiato');
    expect(Number(item.precioUnitario)).toBe(4.00);
  });

  test('Large Vanilla Latte: precioUnitario = 4.00', async () => {
    await request(app).delete('/api/carrito/vaciar/1');
    await request(app)
      .post('/api/carrito')
      .send({ idUsuario: 1, idProducto: 2, cantidad: 1, tamano: 'Large' });

    const res = await request(app).get('/api/carrito/1');
    const item = res.body.data.items[0];

    expect(Number(item.precioUnitario)).toBe(4.00);
  });

  test('Pedido: objetos anidados y calculos', async () => {
    const res = await request(app)
      .post('/api/pedidos')
      .send({ idUsuario: 1, idSucursal: 1, codigoCupon: 'WELCOME' });

    const pedido = res.body.data;
    expect(pedido.numeroPedido).toBeDefined();
    expect('password' in pedido.usuario).toBe(false);
    expect(pedido.sucursal.nombre).toBeDefined();
    expect(pedido.detalles.length).toBeGreaterThan(0);
    expect(pedido.detalles[0].producto.nombre).toBeDefined();
    expect(typeof Number(pedido.subtotal)).toBe('number');
    expect(typeof Number(pedido.descuento)).toBe('number');
    expect(typeof Number(pedido.total)).toBe('number');
  });

  test('Cupon CAVOSH10 (10% off $10.00, min $5.00)', async () => {
    const res = await request(app)
      .post('/api/cupones/validar')
      .send({ codigo: 'CAVOSH10', subtotal: 10.00 });

    expect(res.body.data.valido).toBe(true);
    expect(res.body.data.descuento).toBe(1.00);
    expect(res.body.data.nuevoTotal).toBe(9.00);
  });

  test('Favorito toggle: false -> true -> false', async () => {
    const check1 = await request(app).get('/api/favoritos/check').query({ idUsuario: 1, idProducto: 2 });
    expect(check1.body.data).toBe(false);

    const toggle1 = await request(app).post('/api/favoritos/toggle').query({ idUsuario: 1, idProducto: 2 });
    expect(toggle1.body.data).toBe(true);

    const check2 = await request(app).get('/api/favoritos/check').query({ idUsuario: 1, idProducto: 2 });
    expect(check2.body.data).toBe(true);

    const toggle2 = await request(app).post('/api/favoritos/toggle').query({ idUsuario: 1, idProducto: 2 });
    expect(toggle2.body.data).toBe(false);
  });

  test('Registrar: puntos 124 y password excluido', async () => {
    const res = await request(app)
      .post('/api/auth/registrar')
      .send({ nombreCompleto: 'Test User', email: 'test@cavosh.com', password: 'pass123' });

    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe('test@cavosh.com');
    expect(res.body.data.puntos).toBe(124);
    expect('password' in res.body.data).toBe(false);
  });
});
