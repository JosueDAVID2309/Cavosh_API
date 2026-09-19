const authService = require('../services/auth.service');
const ApiResponse = require('../dtos/ApiResponse');

class AuthController {
  async login(req, res, next) {
    try {
      const response = await authService.login(req.body);
      return res.json(ApiResponse.ok('Inicio de sesión exitoso', response));
    } catch (err) {
      next(err);
    }
  }

  async registrar(req, res, next) {
    try {
      const response = await authService.registrar(req.body);
      return res.json(ApiResponse.ok('Usuario registrado correctamente', response));
    } catch (err) {
      next(err);
    }
  }

  async obtenerPerfil(req, res, next) {
    try {
      const { idUsuario } = req.params;
      const response = await authService.obtenerPerfil(parseInt(idUsuario, 10));
      return res.json(ApiResponse.ok(response));
    } catch (err) {
      next(err);
    }
  }

  async actualizarPreferencias(req, res, next) {
    try {
      const { idUsuario } = req.params;
      const { notificaciones, ubicacion } = req.query;
      const response = await authService.actualizarPreferencias(
        parseInt(idUsuario, 10),
        notificaciones !== undefined ? notificaciones === 'true' : null,
        ubicacion !== undefined ? ubicacion === 'true' : null,
      );
      return res.json(ApiResponse.ok('Preferencias actualizadas', response));
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuthController();
