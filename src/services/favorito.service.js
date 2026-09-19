const { Favorito, Usuario, Producto } = require('../models');
const ResourceNotFoundException = require('../exceptions/ResourceNotFoundException');

class FavoritoService {
  async listarPorUsuario(idUsuario) {
    const favoritos = await Favorito.findAll({
      where: { idUsuario },
      include: [{ model: Producto, as: 'producto' }],
      order: [['fechaAgregado', 'DESC']],
    });

    return favoritos.map((f) => f.producto);
  }

  async toggleFavorito(idUsuario, idProducto) {
    const usuario = await Usuario.findByPk(idUsuario);
    if (!usuario) {
      throw new ResourceNotFoundException('Usuario no encontrado');
    }

    const producto = await Producto.findByPk(idProducto);
    if (!producto) {
      throw new ResourceNotFoundException('Producto no encontrado');
    }

    const existente = await Favorito.findOne({
      where: { idUsuario, idProducto },
    });

    if (existente) {
      await existente.destroy();
      return false;
    } else {
      await Favorito.create({ idUsuario, idProducto });
      return true;
    }
  }

  async esFavorito(idUsuario, idProducto) {
    const count = await Favorito.count({
      where: { idUsuario, idProducto },
    });
    return count > 0;
  }
}

module.exports = new FavoritoService();
