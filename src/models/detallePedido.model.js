const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const DetallePedido = sequelize.define('detalle_pedido', {
  idDetalle: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'id_detalle' },
  idPedido: { type: DataTypes.INTEGER, allowNull: false, field: 'id_pedido' },
  idProducto: { type: DataTypes.INTEGER, allowNull: false, field: 'id_producto' },
  cantidad: { type: DataTypes.INTEGER, allowNull: false },
  tamano: { type: DataTypes.STRING(20), defaultValue: 'Small' },
  tipoLeche: { type: DataTypes.STRING(50), defaultValue: 'Full-fat milk', field: 'tipo_leche' },
  conCrema: { type: DataTypes.STRING(50), defaultValue: 'Without whipped cream', field: 'con_crema' },
  conCafeina: { type: DataTypes.STRING(50), defaultValue: 'With caffeine', field: 'con_cafeina' },
  precioUnitario: { type: DataTypes.DECIMAL(10, 2), allowNull: false, field: 'precio_unitario' },
  subtotal: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
}, {
  tableName: 'detalle_pedido',
  timestamps: false,
});

module.exports = DetallePedido;
