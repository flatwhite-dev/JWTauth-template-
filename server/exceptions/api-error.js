module.exports = class ApiError extends Error {
  status;
  errors;
  code;

  constructor(status, message, code = "", errors = []) {
    super(message);
    this.status = status;
    this.code = code;
    this.errors = errors;
  }

  static Unauthorized(code) {
    return new ApiError(401, "The user is not authorized", code);
  }
  static BadRequest(message, code, errors = []) {
    return new ApiError(400, message, code, errors);
  }
  static Forbidden(message, code, errors = []) {
    return new ApiError(403, message, code, errors);
  }
  static NotFound(message, code, errors = []) {
    return new ApiError(404, message, code, errors);
  }
};
