const productoService = require('../services/producto.service');
const ApiResponse = require('../dtos/ApiResponse');

class ProductoController {
  async listar(req, res, next) {
    try {
      const { categoria } = req.query;
      const productos = await productoService.listar(categoria);
      return res.json(ApiResponse.ok('Productos obtenidos', productos));
    } catch (err) {
      next(err);
    }
  }

  async listarNuevos(req, res, next) {
    try {
      const nuevos = await productoService.listarNuevos();
      return res.json(ApiResponse.ok('Nuevos productos obtenidos', nuevos));
    } catch (err) {
      next(err);
    }
  }

  async listarFrecuentes(req, res, next) {
    try {
      const frecuentes = await productoService.listarFrecuentes();
      return res.json(ApiResponse.ok('Productos frecuentes obtenidos', frecuentes));
    } catch (err) {
      next(err);
    }
  }

  async buscar(req, res, next) {
    try {
      const { q } = req.query;
      const resultados = await productoService.buscar(q);
      return res.json(ApiResponse.ok('Resultados de búsqueda', resultados));
    } catch (err) {
      next(err);
    }
  }

  async obtenerPorId(req, res, next) {
    try {
      const { id } = req.params;
      const producto = await productoService.obtenerPorId(parseInt(id, 10));
      return res.json(ApiResponse.ok('Producto obtenido', producto));
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ProductoController();
