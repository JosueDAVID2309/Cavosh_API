const cuponService = require('../services/cupon.service');
const ApiResponse = require('../dtos/ApiResponse');

class CuponController {
  async validarCupon(req, res, next) {
    try {
      const response = await cuponService.validarCupon(req.body);
      return res.json(ApiResponse.ok(response));
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new CuponController();
