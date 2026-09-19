const express = require('express');
const carritoController = require('../controllers/carrito.controller');

const router = express.Router();

router.post('/', carritoController.agregar);
router.get('/:idUsuario', carritoController.obtenerResumen);
router.put('/:idCarrito/usuario/:idUsuario', carritoController.actualizarCantidad);
router.delete('/:idCarrito/usuario/:idUsuario', carritoController.eliminar);
router.delete('/vaciar/:idUsuario', carritoController.vaciar);

module.exports = router;
