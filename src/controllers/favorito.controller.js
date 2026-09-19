const favoritoService = require('../services/favorito.service');
const ApiResponse = require('../dtos/ApiResponse');

class FavoritoController {
  async listarPorUsuario(req, res, next) {
    try {
      const { idUsuario } = req.params;
      const favoritos = await favoritoService.listarPorUsuario(parseInt(idUsuario, 10));
      return res.json(ApiResponse.ok('Favoritos obtenidos', favoritos));
    } catch (err) {
      next(err);
    }
  }

  async toggleFavorito(req, res, next) {
    try {
      const { idUsuario, idProducto } = req.query;
      const esFavorito = await favoritoService.toggleFavorito(
        parseInt(idUsuario, 10),
        parseInt(idProducto, 10),
      );
      const mensaje = esFavorito ? 'Agregado a favoritos' : 'Eliminado de favoritos';
      return res.json(ApiResponse.ok(mensaje, esFavorito));
    } catch (err) {
      next(err);
    }
  }

  async esFavorito(req, res, next) {
    try {
      const { idUsuario, idProducto } = req.query;
      const favorito = await favoritoService.esFavorito(
        parseInt(idUsuario, 10),
        parseInt(idProducto, 10),
      );
      return res.json(ApiResponse.ok(favorito));
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new FavoritoController();
