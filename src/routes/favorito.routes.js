const express = require('express');
const favoritoController = require('../controllers/favorito.controller');

const router = express.Router();

router.post('/toggle', favoritoController.toggleFavorito);
router.get('/check', favoritoController.esFavorito);
router.get('/:idUsuario', favoritoController.listarPorUsuario);

module.exports = router;
