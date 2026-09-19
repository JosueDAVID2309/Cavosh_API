class ResourceNotFoundException extends Error {
  constructor(message) {
    super(message);
    this.name = 'ResourceNotFoundException';
    this.statusCode = 404;
  }
}

module.exports = ResourceNotFoundException;
