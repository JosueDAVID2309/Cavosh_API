const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Favorito = sequelize.define('favorito', {
  idFavorito: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'id_favorito' },
  idUsuario: { type: DataTypes.INTEGER, allowNull: false, field: 'id_usuario' },
  idProducto: { type: DataTypes.INTEGER, allowNull: false, field: 'id_producto' },
  fechaAgregado: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, field: 'fecha_agregado' },
}, {
  tableName: 'favorito',
  timestamps: false,
  indexes: [
    { unique: true, fields: ['id_usuario', 'id_producto'], name: 'unique_favorito' },
  ],
});

module.exports = Favorito;
