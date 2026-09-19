const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Sucursal = sequelize.define('sucursal', {
  idSucursal: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'id_sucursal' },
  nombre: { type: DataTypes.STRING(100), allowNull: false },
  direccion: { type: DataTypes.STRING(200), allowNull: false },
  ciudad: { type: DataTypes.STRING(100), allowNull: false, defaultValue: 'Lima' },
  horarioAtencion: { type: DataTypes.STRING(100), allowNull: false, defaultValue: 'Open: 8:00 AM - 22:00 PM', field: 'horario_atencion' },
  latitud: { type: DataTypes.DECIMAL(10, 8), defaultValue: -12.046374 },
  longitud: { type: DataTypes.DECIMAL(11, 8), defaultValue: -77.042793 },
  imagenUrl: { type: DataTypes.STRING(255), defaultValue: '', field: 'imagen_url' },
  activa: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
}, {
  tableName: 'sucursal',
  timestamps: false,
});

module.exports = Sucursal;
