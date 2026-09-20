const { sequelize, connectDatabase } = require('../src/config/database');

describe('Database Connection', () => {
  // Aumentamos el timeout a 30s ya que las conexiones a la nube pueden ser lentas
  jest.setTimeout(30000); 

  afterAll(async () => {
    // Cerramos la conexión para que los tests finalicen correctamente
    await sequelize.close();
  });

  it('debería conectarse a la base de datos correctamente', async () => {
    // connectDatabase llama a sequelize.authenticate() internamente
    await expect(connectDatabase()).resolves.not.toThrow();
  });
});
