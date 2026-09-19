const { sequelize, Sequelize, connectDatabase } = require('../config/database');

const Usuario = require('./usuario.model');
const Sucursal = require('./sucursal.model');
const Producto = require('./producto.model');
const Favorito = require('./favorito.model');
const Carrito = require('./carrito.model');
const Cupon = require('./cupon.model');
const MetodoPago = require('./metodoPago.model');
const Pedido = require('./pedido.model');
const DetallePedido = require('./detallePedido.model');

// --- Usuario associations ---
Usuario.hasMany(Carrito, { foreignKey: 'id_usuario', as: 'carritos' });
Usuario.hasMany(Favorito, { foreignKey: 'id_usuario', as: 'favoritos' });
Usuario.hasMany(MetodoPago, { foreignKey: 'id_usuario', as: 'metodosPago' });
Usuario.hasMany(Pedido, { foreignKey: 'id_usuario', as: 'pedidos' });

// --- Sucursal associations ---
Sucursal.hasMany(Pedido, { foreignKey: 'id_sucursal', as: 'pedidos' });

// --- Producto associations ---
Producto.hasMany(Carrito, { foreignKey: 'id_producto', as: 'carritos' });
Producto.hasMany(Favorito, { foreignKey: 'id_producto', as: 'favoritos' });
Producto.hasMany(DetallePedido, { foreignKey: 'id_producto', as: 'detallesPedido' });

// --- Carrito associations ---
Carrito.belongsTo(Usuario, { foreignKey: 'id_usuario', as: 'usuario' });
Carrito.belongsTo(Producto, { foreignKey: 'id_producto', as: 'producto' });

// --- Favorito associations ---
Favorito.belongsTo(Usuario, { foreignKey: 'id_usuario', as: 'usuario' });
Favorito.belongsTo(Producto, { foreignKey: 'id_producto', as: 'producto' });

// --- MetodoPago associations ---
MetodoPago.belongsTo(Usuario, { foreignKey: 'id_usuario', as: 'usuario' });

// --- Pedido associations ---
Pedido.belongsTo(Usuario, { foreignKey: 'id_usuario', as: 'usuario' });
Pedido.belongsTo(Sucursal, { foreignKey: 'id_sucursal', as: 'sucursal' });
Pedido.hasMany(DetallePedido, { foreignKey: 'id_pedido', as: 'detalles' });

// --- DetallePedido associations ---
DetallePedido.belongsTo(Pedido, { foreignKey: 'id_pedido', as: 'pedido' });
DetallePedido.belongsTo(Producto, { foreignKey: 'id_producto', as: 'producto' });

module.exports = {
  sequelize,
  Sequelize,
  connectDatabase,
  Usuario,
  Sucursal,
  Producto,
  Favorito,
  Carrito,
  Cupon,
  MetodoPago,
  Pedido,
  DetallePedido,
};
