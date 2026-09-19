function AuthResponse(data) {
  return {
    idUsuario: data.idUsuario,
    nombreCompleto: data.nombreCompleto,
    email: data.email,
    puntos: data.puntos,
    telefono: data.telefono,
    avatarUrl: data.avatarUrl,
    recibirNotificaciones: data.recibirNotificaciones,
    compartirUbicacion: data.compartirUbicacion,
  };
}

module.exports = AuthResponse;
