const express = require('express');
const productoController = require('../controllers/producto.controller');

const router = express.Router();

router.get('/nuevos', productoController.listarNuevos);
router.get('/frecuentes', productoController.listarFrecuentes);
router.get('/buscar', productoController.buscar);
router.get('/', productoController.listar);
router.get('/:id', productoController.obtenerPorId);

module.exports = router;
