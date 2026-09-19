function ApiResponse(success, message, data, status = null) {
  return {
    success,
    error: !success,
    message,
    status,
    timestamp: new Date().toISOString(),
    data,
  };
}

ApiResponse.ok = function ok(messageOrData, data) {
  if (data === undefined) {
    return ApiResponse(true, 'Operación exitosa', messageOrData, 200);
  }
  return ApiResponse(true, messageOrData, data, 200);
};

ApiResponse.error = function error(message, statusCode) {
  return ApiResponse(false, message, null, statusCode || 500);
};

module.exports = ApiResponse;
