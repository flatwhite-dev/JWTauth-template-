const ApiError = require("../exceptions/api-error");
const tokenService = require("../service/token-service");
const { ERROR } = require("../exceptions/errors");

module.exports = function (req, res, next) {
  try {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) {
      return next(ApiError.Unauthorized(ERROR.AUTH_UNAUTHORIZED));
    }

    const accessToken = authorizationHeader.split(" ")[1];
    if (!accessToken) {
      return next(ApiError.Unauthorized(ERROR.AUTH_UNAUTHORIZED));
    }

    const userData = tokenService.validateAccessToken(accessToken);
    if (!userData) {
      return next(ApiError.Unauthorized(ERROR.AUTH_UNAUTHORIZED));
    }
    req.user = userData;
    next();
  } catch (e) {
    return next(ApiError.Unauthorized(ERROR.AUTH_UNAUTHORIZED));
  }
};
