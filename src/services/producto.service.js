const { Producto } = require('../models');
const ResourceNotFoundException = require('../exceptions/ResourceNotFoundException');

class ProductoService {
  async listar(categoria) {
    if (!categoria || categoria.trim() === '' || categoria.toLowerCase() === 'todos') {
      return Producto.findAll();
    }
    return Producto.findAll({
      where: { categoria: categoria.trim() },
    });
  }

  async listarNuevos() {
    return Producto.findAll({ where: { esNuevo: true } });
  }

  async listarFrecuentes() {
    return Producto.findAll({ where: { esFrecuente: true } });
  }

  async buscar(termino) {
    if (!termino || termino.trim() === '') {
      return Producto.findAll();
    }
    const { Op } = require('sequelize');
    return Producto.findAll({
      where: {
        [Op.or]: [
          { nombre: { [Op.like]: `%${termino}%` } },
          { descripcion: { [Op.like]: `%${termino}%` } },
        ],
      },
    });
  }

  async obtenerPorId(idProducto) {
    const producto = await Producto.findByPk(idProducto);
    if (!producto) {
      throw new ResourceNotFoundException(`Producto no encontrado con ID: ${idProducto}`);
    }
    return producto;
  }
}

module.exports = new ProductoService();
