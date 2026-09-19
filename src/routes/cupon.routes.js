const express = require('express');
const cuponController = require('../controllers/cupon.controller');

const router = express.Router();

router.post('/validar', cuponController.validarCupon);

module.exports = router;
