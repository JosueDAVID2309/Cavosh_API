const express = require('express');
const corsMiddleware = require('./config/cors');
const healthRoutes = require('./routes/health.routes');
const authRoutes = require('./routes/auth.routes');
const carritoRoutes = require('./routes/carrito.routes');
const cuponRoutes = require('./routes/cupon.routes');
const favoritoRoutes = require('./routes/favorito.routes');
const pedidoRoutes = require('./routes/pedido.routes');
const productoRoutes = require('./routes/producto.routes');
const sucursalRoutes = require('./routes/sucursal.routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(corsMiddleware);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Cavosh Cafe API - Node.js Express Server',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      productos: '/api/productos',
      sucursales: '/api/sucursales',
      carrito: '/api/carrito',
      cupones: '/api/cupones',
      favoritos: '/api/favoritos',
      pedidos: '/api/pedidos',
    },
  });
});

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/carrito', carritoRoutes);
app.use('/api/cupones', cuponRoutes);
app.use('/api/favoritos', favoritoRoutes);
app.use('/api/pedidos', pedidoRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/sucursales', sucursalRoutes);

app.use(errorHandler);

module.exports = app;
