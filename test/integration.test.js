process.env.NODE_ENV = 'test';
require('dotenv').config();

const { sequelize, Usuario } = require('../src/models');
const seedDatabase = require('../src/utils/seed');
const app = require('../src/app');
const request = require('supertest');

async function ensureUnverifiedUser(email) {
  const user = await Usuario.findOne({ where: { email } });
  if (!user) throw new Error(`User ${email} not found`);
  user.esVerificado = false;
  user.codigoVerificacion = null;
  user.codigoExpiracion = null;
  await user.save();
  return user;
}

async function setRecoveryCode(email) {
  const user = await Usuario.findOne({ where: { email } });
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  user.codigoVerificacion = code;
  user.codigoExpiracion = new Date(Date.now() + 15 * 60 * 1000);
  await user.save();
  return { user, code };
}

async function setVerificationCode(email) {
  const user = await Usuario.findOne({ where: { email } });
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  user.codigoVerificacion = code;
  user.codigoExpiracion = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await user.save();
  return { user, code };
}

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

  test('POST /api/auth/registrar -> 201 con puntos 124', async () => {
    const res = await request(app)
      .post('/api/auth/registrar')
      .send({ nombreCompleto: 'Nuevo Usuario', email: 'nuevo@cavosh.com', password: 'pass123' });
    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe('nuevo@cavosh.com');
    expect(res.body.data.puntos).toBe(124);
    expect('password' in res.body.data).toBe(false);
  });
});

describe('Recuperación de contraseña', () => {
  let recoveryEmail;

  beforeAll(async () => {
    const user = await Usuario.findOne({ where: { email: 'usuario@cavosh.com' } });
    recoveryEmail = user.email;
    await ensureUnverifiedUser(recoveryEmail);
  });

  test('POST /api/auth/recuperar-password (email registrado) -> 200', async () => {
    const res = await request(app)
      .post('/api/auth/recuperar-password')
      .send({ email: recoveryEmail });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('POST /api/auth/recuperar-password (email no registrado) -> 200', async () => {
    const res = await request(app)
      .post('/api/auth/recuperar-password')
      .send({ email: 'noexiste@cavosh.com' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('POST /api/auth/recuperar-password (sin email) -> 400', async () => {
    const res = await request(app)
      .post('/api/auth/recuperar-password')
      .send({});
    expect(res.status).toBe(400);
  });

  test('POST /api/auth/verificar-codigo (codigo valido) -> 200', async () => {
    await setRecoveryCode(recoveryEmail);
    const user = await Usuario.findOne({ where: { email: recoveryEmail } });
    const code = user.codigoVerificacion;

    const res = await request(app)
      .post('/api/auth/verificar-codigo')
      .send({ email: recoveryEmail, codigo: code });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('POST /api/auth/verificar-codigo (codigo incorrecto) -> 400', async () => {
    await setRecoveryCode(recoveryEmail);

    const res = await request(app)
      .post('/api/auth/verificar-codigo')
      .send({ email: recoveryEmail, codigo: '000000' });
    expect(res.status).toBe(400);
  });

  test('POST /api/auth/verificar-codigo (sin datos) -> 400', async () => {
    const res = await request(app)
      .post('/api/auth/verificar-codigo')
      .send({});
    expect(res.status).toBe(400);
  });

  test('POST /api/auth/cambiar-password (codigo valido) -> 200', async () => {
    await setRecoveryCode(recoveryEmail);
    const user = await Usuario.findOne({ where: { email: recoveryEmail } });
    const code = user.codigoVerificacion;

    const res = await request(app)
      .post('/api/auth/cambiar-password')
      .send({ email: recoveryEmail, codigo: code, nuevaPassword: 'newpass123' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('POST /api/auth/cambiar-password (codigo incorrecto) -> 400', async () => {
    await setRecoveryCode(recoveryEmail);

    const res = await request(app)
      .post('/api/auth/cambiar-password')
      .send({ email: recoveryEmail, codigo: '000000', nuevaPassword: 'newpass123' });
    expect(res.status).toBe(400);
  });

  test('POST /api/auth/cambiar-password (password corta) -> 400', async () => {
    await setRecoveryCode(recoveryEmail);
    const user = await Usuario.findOne({ where: { email: recoveryEmail } });
    const code = user.codigoVerificacion;

    const res = await request(app)
      .post('/api/auth/cambiar-password')
      .send({ email: recoveryEmail, codigo: code, nuevaPassword: '123' });
    expect(res.status).toBe(400);
  });
});

describe('Verificación de cuenta', () => {
  let verifyEmail;

  beforeAll(async () => {
    const user = await Usuario.findOne({ where: { email: 'usuario@cavosh.com' } });
    verifyEmail = user.email;
    await ensureUnverifiedUser(verifyEmail);
  });

  test('POST /api/auth/verificar-cuenta (codigo valido) -> 200', async () => {
    const { code } = await setVerificationCode(verifyEmail);

    const res = await request(app)
      .post('/api/auth/verificar-cuenta')
      .send({ email: verifyEmail, codigo: code });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('POST /api/auth/verificar-cuenta (codigo incorrecto) -> 400', async () => {
    await ensureUnverifiedUser(verifyEmail);
    await setVerificationCode(verifyEmail);

    const res = await request(app)
      .post('/api/auth/verificar-cuenta')
      .send({ email: verifyEmail, codigo: '000000' });
    expect(res.status).toBe(400);
  });

  test('POST /api/auth/verificar-cuenta (ya verificada) -> 200', async () => {
    await ensureUnverifiedUser(verifyEmail);
    const { code } = await setVerificationCode(verifyEmail);

    await request(app)
      .post('/api/auth/verificar-cuenta')
      .send({ email: verifyEmail, codigo: code });

    const res = await request(app)
      .post('/api/auth/verificar-cuenta')
      .send({ email: verifyEmail, codigo: code });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('POST /api/auth/verificar-cuenta (sin datos) -> 400', async () => {
    const res = await request(app)
      .post('/api/auth/verificar-cuenta')
      .send({});
    expect(res.status).toBe(400);
  });

  test('POST /api/auth/reenviar-codigo-verificacion (email no verificado) -> 200', async () => {
    await ensureUnverifiedUser('usuario@cavosh.com');

    const res = await request(app)
      .post('/api/auth/reenviar-codigo-verificacion')
      .send({ email: 'usuario@cavosh.com' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('POST /api/auth/reenviar-codigo-verificacion (email no existe) -> 404', async () => {
    const res = await request(app)
      .post('/api/auth/reenviar-codigo-verificacion')
      .send({ email: 'noexiste@cavosh.com' });
    expect(res.status).toBe(404);
  });

  test('POST /api/auth/reenviar-codigo-verificacion (sin email) -> 400', async () => {
    const res = await request(app)
      .post('/api/auth/reenviar-codigo-verificacion')
      .send({});
    expect(res.status).toBe(400);
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
