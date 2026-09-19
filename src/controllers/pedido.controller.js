const pedidoService = require('../services/pedido.service');
const ApiResponse = require('../dtos/ApiResponse');

class PedidoController {
  async crearPedido(req, res, next) {
    try {
      const pedido = await pedidoService.crearPedido(req.body);
      return res.json(ApiResponse.ok('Pedido creado con éxito', pedido));
    } catch (err) {
      next(err);
    }
  }

  async obtenerPorId(req, res, next) {
    try {
      const { id } = req.params;
      const pedido = await pedidoService.obtenerPorId(parseInt(id, 10));
      return res.json(ApiResponse.ok(pedido));
    } catch (err) {
      next(err);
    }
  }

  async obtenerPorNumero(req, res, next) {
    try {
      const { numeroPedido } = req.params;
      const pedido = await pedidoService.obtenerPorNumero(numeroPedido);
      return res.json(ApiResponse.ok(pedido));
    } catch (err) {
      next(err);
    }
  }

  async listarPorUsuario(req, res, next) {
    try {
      const { idUsuario } = req.params;
      const pedidos = await pedidoService.listarPorUsuario(parseInt(idUsuario, 10));
      return res.json(ApiResponse.ok(pedidos));
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new PedidoController();
