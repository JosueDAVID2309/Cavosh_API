const { Usuario } = require('../models');
const AuthResponse = require('../dtos/AuthResponse');
const BadRequestException = require('../exceptions/BadRequestException');
const ResourceNotFoundException = require('../exceptions/ResourceNotFoundException');

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

    if (usuario.password !== password) {
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

    const nuevo = await Usuario.create({
      nombreCompleto: nombreCompleto.trim(),
      email: emailLower,
      password,
      puntos: 124,
      telefono: '+51 987 654 321',
      avatarUrl: '',
      recibirNotificaciones: true,
      compartirUbicacion: true,
    });

    return AuthResponse(nuevo);
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
}

module.exports = new AuthService();
