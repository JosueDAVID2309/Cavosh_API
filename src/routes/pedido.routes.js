const express = require('express');
const pedidoController = require('../controllers/pedido.controller');

const router = express.Router();

router.post('/', pedidoController.crearPedido);
router.get('/tracking/:numeroPedido', pedidoController.obtenerPorNumero);
router.get('/usuario/:idUsuario', pedidoController.listarPorUsuario);
router.get('/:id', pedidoController.obtenerPorId);

module.exports = router;
