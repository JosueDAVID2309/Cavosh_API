const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Carrito = sequelize.define('carrito', {
  idCarrito: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'id_carrito' },
  idUsuario: { type: DataTypes.INTEGER, allowNull: false, field: 'id_usuario' },
  idProducto: { type: DataTypes.INTEGER, allowNull: false, field: 'id_producto' },
  cantidad: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  tamano: { type: DataTypes.STRING(20), defaultValue: 'Small' },
  tipoLeche: { type: DataTypes.STRING(50), defaultValue: 'Full-fat milk', field: 'tipo_leche' },
  conCrema: { type: DataTypes.STRING(50), defaultValue: 'Without whipped cream', field: 'con_crema' },
  conCafeina: { type: DataTypes.STRING(50), defaultValue: 'With caffeine', field: 'con_cafeina' },
  precioUnitario: { type: DataTypes.DECIMAL(10, 2), allowNull: false, field: 'precio_unitario' },
  subtotal: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  fechaAgregado: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, field: 'fecha_agregado' },
}, {
  tableName: 'carrito',
  timestamps: false,
});

module.exports = Carrito;
