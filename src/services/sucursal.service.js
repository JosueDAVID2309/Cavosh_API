const { Sucursal } = require('../models');
const ResourceNotFoundException = require('../exceptions/ResourceNotFoundException');

class SucursalService {
  async listarTodas() {
    return Sucursal.findAll({ where: { activa: true } });
  }

  async buscarPorCiudad(ciudad) {
    if (!ciudad || ciudad.trim() === '') {
      return Sucursal.findAll({ where: { activa: true } });
    }
    return Sucursal.findAll({
      where: { ciudad: ciudad.trim(), activa: true },
    });
  }

  async obtenerPorId(idSucursal) {
    const sucursal = await Sucursal.findByPk(idSucursal);
    if (!sucursal) {
      throw new ResourceNotFoundException(`Sucursal no encontrada con ID: ${idSucursal}`);
    }
    return sucursal;
  }
}

module.exports = new SucursalService();
