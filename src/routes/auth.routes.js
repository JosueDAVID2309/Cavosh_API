const express = require('express');
const authController = require('../controllers/auth.controller');

const router = express.Router();

router.post('/login', authController.login);
router.post('/registrar', authController.registrar);
router.get('/perfil/:idUsuario', authController.obtenerPerfil);
router.put('/perfil/:idUsuario/preferencias', authController.actualizarPreferencias);

// Recuperación de contraseña
router.post('/recuperar-password', authController.solicitarRecuperacion);
router.post('/verificar-codigo', authController.verificarCodigo);
router.post('/cambiar-password', authController.cambiarPassword);

// Verificación de cuenta
router.post('/verificar-cuenta', authController.verificarCuenta);
router.post('/reenviar-codigo-verificacion', authController.reenviarCodigoVerificacion);

module.exports = router;
