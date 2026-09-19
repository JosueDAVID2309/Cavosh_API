const sucursalService = require('../services/sucursal.service');
const ApiResponse = require('../dtos/ApiResponse');

class SucursalController {
  async listarTodas(req, res, next) {
    try {
      const sucursales = await sucursalService.listarTodas();
      return res.json(ApiResponse.ok('Sucursales obtenidas', sucursales));
    } catch (err) {
      next(err);
    }
  }

  async buscarPorCiudad(req, res, next) {
    try {
      const { ciudad } = req.query;
      const sucursales = await sucursalService.buscarPorCiudad(ciudad);
      return res.json(ApiResponse.ok(`Sucursales de ${ciudad}`, sucursales));
    } catch (err) {
      next(err);
    }
  }

  async obtenerPorId(req, res, next) {
    try {
      const { id } = req.params;
      const sucursal = await sucursalService.obtenerPorId(parseInt(id, 10));
      return res.json(ApiResponse.ok('Sucursal obtenida', sucursal));
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new SucursalController();
