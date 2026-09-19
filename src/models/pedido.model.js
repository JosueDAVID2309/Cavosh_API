const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Pedido = sequelize.define('pedido', {
  idPedido: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'id_pedido' },
  idUsuario: { type: DataTypes.INTEGER, allowNull: false, field: 'id_usuario' },
  idSucursal: { type: DataTypes.INTEGER, allowNull: false, field: 'id_sucursal' },
  numeroPedido: { type: DataTypes.STRING(20), allowNull: false, unique: true, field: 'numero_pedido' },
  metodoEntrega: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'PICKUP', field: 'metodo_entrega' },
  fechaEntrega: { type: DataTypes.DATEONLY, field: 'fecha_entrega' },
  horaEntrega: { type: DataTypes.STRING(20), defaultValue: '08:00 AM', field: 'hora_entrega' },
  metodoPago: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'CARD', field: 'metodo_pago' },
  tarjetaUltimos4: { type: DataTypes.STRING(4), defaultValue: '2048', field: 'tarjeta_ultimos4' },
  subtotal: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  descuento: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0.00 },
  total: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  codigoCupon: { type: DataTypes.STRING(50), field: 'codigo_cupon', allowNull: true },
  estado: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'PLACED' },
  fechaCreacion: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, field: 'fecha_creacion' },
}, {
  tableName: 'pedido',
  timestamps: false,
});

module.exports = Pedido;
