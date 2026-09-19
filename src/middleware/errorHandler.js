const { ValidationError } = require('sequelize');
const BadRequestException = require('../exceptions/BadRequestException');
const ResourceNotFoundException = require('../exceptions/ResourceNotFoundException');
const ApiResponse = require('../dtos/ApiResponse');

function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  if (err instanceof BadRequestException) {
    return res.status(400).json(ApiResponse.error(err.message, 400));
  }

  if (err instanceof ResourceNotFoundException) {
    return res.status(404).json(ApiResponse.error(err.message, 404));
  }

  if (err instanceof ValidationError) {
    const messages = err.errors.map((e) => e.message).join('; ');
    return res.status(400).json(ApiResponse.error(messages, 400));
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors[0]?.path || 'campo';
    return res.status(400).json(ApiResponse.error(`El valor del campo ${field} ya está en uso`, 400));
  }

  console.error('[ERROR]', err);
  res.status(500).json(ApiResponse.error('Error en el servidor: ' + err.message, 500));
}

module.exports = errorHandler;
