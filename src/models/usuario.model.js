const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Usuario = sequelize.define('usuario', {
  idUsuario: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'id_usuario' },
  nombreCompleto: { type: DataTypes.STRING(100), allowNull: false, field: 'nombre_completo' },
  email: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  password: { type: DataTypes.STRING(255), allowNull: false },
  puntos: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 124 },
  telefono: { type: DataTypes.STRING(20), defaultValue: '+51 987 654 321' },
  avatarUrl: { type: DataTypes.STRING(255), defaultValue: '', field: 'avatar_url' },
  codigoVerificacion: { type: DataTypes.STRING(6), allowNull: true, field: 'codigo_verificacion' },
  codigoExpiracion: { type: DataTypes.DATE, allowNull: true, field: 'codigo_expiracion' },
  esVerificado: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: 'es_verificado' },
  recibirNotificaciones: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true, field: 'recibir_notificaciones' },
  compartirUbicacion: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true, field: 'compartir_ubicacion' },
  fechaRegistro: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, field: 'fecha_registro' },
}, {
  tableName: 'usuario',
  timestamps: false,
  defaultScope: {
    attributes: { exclude: ['password'] },
  },
  scopes: {
    withPassword: { attributes: {} },
  },
});

module.exports = Usuario;
