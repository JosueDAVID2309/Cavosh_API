require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 8080;

async function startServer() {
  try {

    app.listen(PORT, () => {
      console.log(`[SERVER] Cavosh Cafe API corriendo en http://localhost:${PORT}`);
      console.log(`[API] Base URL: http://localhost:${PORT}/api`);
      console.log(`[DB] Base de datos: ${process.env.DB_NAME || 'cavosh_cafe'}`);
    });
  } catch (err) {
    console.error('[FATAL] No se pudo iniciar el servidor:', err.message);
    process.exit(1);
  }
}

startServer();
