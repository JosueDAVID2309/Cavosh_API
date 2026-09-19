const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Producto = sequelize.define('producto', {
  idProducto: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'id_producto' },
  nombre: { type: DataTypes.STRING(100), allowNull: false },
  descripcion: { type: DataTypes.TEXT },
  precio: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  categoria: { type: DataTypes.STRING(50), allowNull: false },
  imagenUrl: { type: DataTypes.STRING(255), defaultValue: '', field: 'imagen_url' },
  esNuevo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: 'es_nuevo' },
  esFrecuente: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: 'es_frecuente' },
  tamanoMl: { type: DataTypes.INTEGER, defaultValue: 250, field: 'tamano_ml' },
}, {
  tableName: 'producto',
  timestamps: false,
});

module.exports = Producto;
