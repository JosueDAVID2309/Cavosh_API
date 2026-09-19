const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MetodoPago = sequelize.define('metodo_pago', {
  idMetodo: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'id_metodo' },
  idUsuario: { type: DataTypes.INTEGER, allowNull: false, field: 'id_usuario' },
  tipoTarjeta: { type: DataTypes.STRING(50), allowNull: false, defaultValue: 'MasterCard', field: 'tipo_tarjeta' },
  ultimosCuatro: { type: DataTypes.STRING(4), allowNull: false, field: 'ultimos_cuatro' },
  titular: { type: DataTypes.STRING(100), allowNull: false },
  esPredeterminada: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: 'es_predeterminada' },
}, {
  tableName: 'metodo_pago',
  timestamps: false,
});

module.exports = MetodoPago;
