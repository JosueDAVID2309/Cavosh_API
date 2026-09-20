const bcrypt = require('bcryptjs');
const { Usuario } = require('../models');
const AuthResponse = require('../dtos/AuthResponse');
const BadRequestException = require('../exceptions/BadRequestException');
const ResourceNotFoundException = require('../exceptions/ResourceNotFoundException');
const { enviarCodigoRecuperacion, enviarCodigoVerificacionCuenta } = require('../utils/email');

class AuthService {
  async login(request) {
    const { email, password } = request;
    if (!email || !password) {
      throw new BadRequestException('Email y contraseña requeridos');
    }

    const usuario = await Usuario.scope('withPassword').findOne({
      where: { email: email.trim().toLowerCase() },
    });

    if (!usuario) {
      throw new ResourceNotFoundException('Credenciales inválidas: usuario no encontrado');
    }

    // Soporta contraseñas hasheadas (bcrypt) y en texto plano (cuentas antiguas)
    const esHash = usuario.password.startsWith('$2');
    const passwordValida = esHash
      ? await bcrypt.compare(password, usuario.password)
      : usuario.password === password;

    if (!passwordValida) {
      throw new BadRequestException('Credenciales inválidas: contraseña incorrecta');
    }

    return AuthResponse(usuario);
  }

  async registrar(request) {
    const { nombreCompleto, email, password } = request;
    if (!email || !password || !nombreCompleto) {
      throw new BadRequestException('Todos los campos son obligatorios');
    }

    const emailLower = email.trim().toLowerCase();

    const exists = await Usuario.findOne({ where: { email: emailLower } });
    if (exists) {
      throw new BadRequestException('El correo electrónico ya se encuentra registrado');
    }

    // Hashear contraseña
    const passwordHasheada = await bcrypt.hash(password, 10);

    // Generar código de verificación (6 dígitos)
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    const expiracion = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    const nuevo = await Usuario.create({
      nombreCompleto: nombreCompleto.trim(),
      email: emailLower,
      password: passwordHasheada,
      puntos: 124,
      telefono: '+51 987 654 321',
      avatarUrl: '',
      codigoVerificacion: codigo,
      codigoExpiracion: expiracion,
      esVerificado: false,
      recibirNotificaciones: true,
      compartirUbicacion: true,
    });

    // Enviar correo de bienvenida y verificación
    try {
      await enviarCodigoVerificacionCuenta(emailLower, nombreCompleto.trim(), codigo);
    } catch (emailError) {
      console.warn('[EMAIL] No se pudo enviar el correo de verificación:', emailError.message);
    }

    const response = AuthResponse(nuevo);
    if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
      response.codigoVerificacionDesarrollo = codigo;
    }
    return response;
  }

  async obtenerPerfil(idUsuario) {
    const usuario = await Usuario.findByPk(idUsuario);
    if (!usuario) {
      throw new ResourceNotFoundException('Usuario no encontrado');
    }
    return AuthResponse(usuario);
  }

  async actualizarPreferencias(idUsuario, notificaciones, ubicacion) {
    const usuario = await Usuario.findByPk(idUsuario);
    if (!usuario) {
      throw new ResourceNotFoundException('Usuario no encontrado');
    }

    if (notificaciones !== null && notificaciones !== undefined) {
      usuario.recibirNotificaciones = notificaciones;
    }
    if (ubicacion !== null && ubicacion !== undefined) {
      usuario.compartirUbicacion = ubicacion;
    }

    await usuario.save();
    return AuthResponse(usuario);
  }

  // ─── Recuperación de contraseña ──────────────────────────────────────────────

  /**
   * Genera un código de 6 dígitos, lo guarda en DB (expira en 15 min) y lo envía por email.
   * En desarrollo también devuelve el código en la respuesta para facilitar pruebas.
   */
  async solicitarRecuperacion(email) {
    if (!email) {
      throw new BadRequestException('El email es requerido');
    }

    const usuario = await Usuario.findOne({ where: { email: email.trim().toLowerCase() } });

    // No revelamos si el email existe o no (seguridad)
    if (!usuario) {
      return { mensaje: 'Si el correo está registrado, recibirás un código en breve.' };
    }

    // Genera código de 6 dígitos
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    const expiracion = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    usuario.codigoVerificacion = codigo;
    usuario.codigoExpiracion = expiracion;
    await usuario.save();

    // Envía el email (no bloquea si falla en dev)
    try {
      await enviarCodigoRecuperacion(usuario.email, codigo);
    } catch (emailError) {
      console.warn('[EMAIL] No se pudo enviar el correo:', emailError.message);
    }

    const respuesta = { mensaje: 'Si el correo está registrado, recibirás un código en breve.' };

    // En desarrollo, incluir el código en la respuesta para facilitar pruebas
    if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
      respuesta.codigoDesarrollo = codigo;
    }

    return respuesta;
  }

  /**
   * Valida que el código de recuperación sea correcto y no haya expirado.
   */
  async verificarCodigo(email, codigo) {
    if (!email || !codigo) {
      throw new BadRequestException('Email y código son requeridos');
    }

    const usuario = await Usuario.scope('withPassword').findOne({
      where: { email: email.trim().toLowerCase() },
    });

    if (!usuario || !usuario.codigoVerificacion) {
      throw new BadRequestException('Código inválido o expirado');
    }

    if (usuario.codigoVerificacion !== codigo.trim()) {
      throw new BadRequestException('Código incorrecto');
    }

    if (new Date() > new Date(usuario.codigoExpiracion)) {
      throw new BadRequestException('El código ha expirado. Solicita uno nuevo.');
    }

    return { mensaje: 'Código verificado correctamente. Puedes cambiar tu contraseña.' };
  }

  /**
   * Valida el código y actualiza la contraseña del usuario (hasheada con bcrypt).
   */
  async cambiarPassword(email, codigo, nuevaPassword) {
    if (!email || !codigo || !nuevaPassword) {
      throw new BadRequestException('Email, código y nueva contraseña son requeridos');
    }

    if (nuevaPassword.length < 6) {
      throw new BadRequestException('La contraseña debe tener al menos 6 caracteres');
    }

    const usuario = await Usuario.scope('withPassword').findOne({
      where: { email: email.trim().toLowerCase() },
    });

    if (!usuario || !usuario.codigoVerificacion) {
      throw new BadRequestException('Código inválido o expirado');
    }

    if (usuario.codigoVerificacion !== codigo.trim()) {
      throw new BadRequestException('Código incorrecto');
    }

    if (new Date() > new Date(usuario.codigoExpiracion)) {
      throw new BadRequestException('El código ha expirado. Solicita uno nuevo.');
    }

    // Hashear la nueva contraseña y limpiar el código de recuperación
    const passwordHasheada = await bcrypt.hash(nuevaPassword, 10);
    usuario.password = passwordHasheada;
    usuario.codigoVerificacion = null;
    usuario.codigoExpiracion = null;
    await usuario.save();

    return { mensaje: 'Contraseña actualizada correctamente.' };
  }

  // ─── Verificación de cuenta ──────────────────────────────────────────────────

  /**
   * Verifica la cuenta del usuario validando el código de 6 dígitos.
   */
  async verificarCuenta(email, codigo) {
    if (!email || !codigo) {
      throw new BadRequestException('Email y código son requeridos');
    }

    const usuario = await Usuario.findOne({
      where: { email: email.trim().toLowerCase() },
    });

    if (!usuario) {
      throw new ResourceNotFoundException('Usuario no encontrado');
    }

    if (usuario.esVerificado) {
      return { mensaje: 'Esta cuenta ya ha sido verificada anteriormente.' };
    }

    if (!usuario.codigoVerificacion) {
      throw new BadRequestException('No hay un proceso de verificación activo');
    }

    if (usuario.codigoVerificacion !== codigo.trim()) {
      throw new BadRequestException('Código incorrecto');
    }

    if (new Date() > new Date(usuario.codigoExpiracion)) {
      throw new BadRequestException('El código ha expirado. Solicita un reenvío.');
    }

    usuario.esVerificado = true;
    usuario.codigoVerificacion = null;
    usuario.codigoExpiracion = null;
    await usuario.save();

    return {
      mensaje: '¡Cuenta verificada con éxito!',
      usuario: AuthResponse(usuario),
    };
  }

  /**
   * Reenvía un nuevo código de verificación para activar la cuenta.
   */
  async reenviarCodigoVerificacion(email) {
    if (!email) {
      throw new BadRequestException('El email es requerido');
    }

    const usuario = await Usuario.findOne({
      where: { email: email.trim().toLowerCase() },
    });

    if (!usuario) {
      throw new ResourceNotFoundException('Usuario no encontrado');
    }

    if (usuario.esVerificado) {
      return { mensaje: 'La cuenta ya se encuentra verificada.' };
    }

    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    const expiracion = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    usuario.codigoVerificacion = codigo;
    usuario.codigoExpiracion = expiracion;
    await usuario.save();

    try {
      await enviarCodigoVerificacionCuenta(usuario.email, usuario.nombreCompleto, codigo);
    } catch (emailError) {
      console.warn('[EMAIL] Error al reenviar código:', emailError.message);
    }

    const respuesta = { mensaje: 'Se ha enviado un nuevo código a tu correo.' };
    if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
      respuesta.codigoDesarrollo = codigo;
    }

    return respuesta;
  }
}

module.exports = new AuthService();
