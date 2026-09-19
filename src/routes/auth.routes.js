const express = require('express');
const authController = require('../controllers/auth.controller');

const router = express.Router();

router.post('/login', authController.login);
router.post('/registrar', authController.registrar);
router.get('/perfil/:idUsuario', authController.obtenerPerfil);
router.put('/perfil/:idUsuario/preferencias', authController.actualizarPreferencias);

module.exports = router;
