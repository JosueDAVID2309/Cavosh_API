const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Cupon = sequelize.define('cupon', {
  idCupon: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'id_cupon' },
  codigo: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  porcentajeDescuento: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0.00, field: 'porcentaje_descuento' },
  montoFijo: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00, field: 'monto_fijo' },
  compraMinima: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00, field: 'compra_minima' },
  activo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  fechaExpiracion: { type: DataTypes.DATEONLY, field: 'fecha_expiracion' },
}, {
  tableName: 'cupon',
  timestamps: false,
});

module.exports = Cupon;
