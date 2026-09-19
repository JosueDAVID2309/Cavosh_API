const express = require('express');
const sucursalController = require('../controllers/sucursal.controller');

const router = express.Router();

router.get('/ciudad', sucursalController.buscarPorCiudad);
router.get('/', sucursalController.listarTodas);
router.get('/:id', sucursalController.obtenerPorId);

module.exports = router;
