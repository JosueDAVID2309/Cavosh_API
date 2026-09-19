const carritoService = require('../services/carrito.service');
const ApiResponse = require('../dtos/ApiResponse');

class CarritoController {
  async agregar(req, res, next) {
    try {
      const item = await carritoService.agregar(req.body);
      return res.json(ApiResponse.ok('Producto agregado al carrito', item));
    } catch (err) {
      next(err);
    }
  }

  async obtenerResumen(req, res, next) {
    try {
      const { idUsuario } = req.params;
      const resumen = await carritoService.obtenerResumen(parseInt(idUsuario, 10));
      return res.json(ApiResponse.ok('Carrito obtenido', resumen));
    } catch (err) {
      next(err);
    }
  }

  async actualizarCantidad(req, res, next) {
    try {
      const { idCarrito, idUsuario } = req.params;
      const { cantidad } = req.query;
      const item = await carritoService.actualizarCantidad(
        parseInt(idCarrito, 10),
        parseInt(idUsuario, 10),
        parseInt(cantidad, 10),
      );
      if (item === null) {
        return res.json(ApiResponse.ok('Producto eliminado del carrito', null));
      }
      return res.json(ApiResponse.ok('Cantidad actualizada', item));
    } catch (err) {
      next(err);
    }
  }

  async eliminar(req, res, next) {
    try {
      const { idCarrito, idUsuario } = req.params;
      await carritoService.eliminar(
        parseInt(idCarrito, 10),
        parseInt(idUsuario, 10),
      );
      return res.json(ApiResponse.ok('Producto eliminado del carrito', null));
    } catch (err) {
      next(err);
    }
  }

  async vaciar(req, res, next) {
    try {
      const { idUsuario } = req.params;
      await carritoService.vaciar(parseInt(idUsuario, 10));
      return res.json(ApiResponse.ok('Carrito vaciado correctamente', null));
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new CarritoController();
