export class ApiError extends Error {
  constructor(status, message, code) {
    super(message);
    this.status = status;
    this.code = code || this.generateCodeFromStatus(status);
    this.name = 'ApiError';
  }

  generateCodeFromStatus(status) {
    const statusCodes = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'UNPROCESSABLE_ENTITY',
      500: 'INTERNAL_SERVER_ERROR'
    };
    return statusCodes[status] || 'UNKNOWN_ERROR';
  }

  static badRequest(message) {
    return new ApiError(400, message || 'Bad Request');
  }

  static unauthorized(message) {
    return new ApiError(401, message || 'Unauthorized');
  }

  static forbidden(message) {
    return new ApiError(403, message || 'Forbidden');
  }

  static notFound(message) {
    return new ApiError(404, message || 'Not Found');
  }

  static conflict(message) {
    return new ApiError(409, message || 'Conflict');
  }

  static internal(message) {
    return new ApiError(500, message || 'Internal Server Error');
  }
}
