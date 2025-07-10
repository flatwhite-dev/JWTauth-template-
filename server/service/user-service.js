const UserModel = require("../models/user-model");
const bcrypt = require("bcrypt");
const uuid = require("uuid");
const mailService = require("./mail-service");
const tokenService = require("./token-service");
const UserDto = require("../dtos/user-dto");
const ApiError = require("../exceptions/api-error");
const { ERROR } = require("../exceptions/errors");

const { randomInt } = require("crypto");

function generateActivationCode() {
  const code = randomInt(100_000, 1_000_000); // 100000-999999
  return code.toString(); // "241830"
}

class UserService {
  async registration(email, password) {
    const candidate = await UserModel.findOne({ email });
    if (candidate) {
      throw ApiError.BadRequest(
        `User with email ${email} already exist`,
        ERROR.AUTH_EMAIL_EXISTS
      );
    }
    const hashPassword = await bcrypt.hash(password, 7);
    const activationLink = uuid.v4();
    const activationCode = generateActivationCode();

    const user = await UserModel.create({
      email,
      password: hashPassword,
      activationLink,
      activationCode,
    });

    await mailService.sendActivationMail(
      email,
      `${process.env.API_URL}api/activate/${activationLink}`,
      activationCode
    );

    const userDto = new UserDto(user); // id, email, isActivated
    const tokens = tokenService.generateTokens({ ...userDto });
    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return {
      ...tokens,
      user: userDto,
    };
  }

  async activate(activationLink) {
    const user = await UserModel.findOne({ activationLink });

    if (!user) {
      throw ApiError.BadRequest(
        "Incorrect activation link",
        ERROR.AUTH_BAD_LINK
      );
    }
    user.isActivated = true;
    await user.save();
  }

  async activateByCode(refreshToken, activationCode) {
    if (!refreshToken) {
      throw ApiError.Unauthorized(ERROR.AUTH_UNAUTHORIZED);
    }
    const userData = tokenService.validateRefreshToken(refreshToken);
    const tokenFromDB = await tokenService.findToken(refreshToken);
    if (!userData || !tokenFromDB) {
      throw ApiError.Unauthorized(ERROR.AUTH_UNAUTHORIZED);
    }
    const user = await UserModel.findById(userData.id);
    if (!user) {
      throw ApiError.BadRequest("No registered user", ERROR.AUTH_BAD_LINK);
    }
    const isCorrectCode = activationCode === user.activationCode;
    if (!isCorrectCode) {
      throw ApiError.BadRequest(
        "Incorrect activation code",
        ERROR.AUTH_BAD_LINK
      );
    }
    user.isActivated = true;
    await user.save();
  }

  async login(email, password) {
    const user = await UserModel.findOne({ email });
    if (!user) {
      throw ApiError.NotFound("User not found", ERROR.AUTH_USER_NOT_FOUND);
    }
    const isPassEquals = await bcrypt.compare(password, user.password);
    if (!isPassEquals) {
      throw ApiError.BadRequest(
        "Incorrect password",
        ERROR.AUTH_INCORRECT_PASS
      );
    }
    // const isActivated = user.isActivated;
    // if (!isActivated) {
    //   throw ApiError.BadRequest(
    //     "Non-activated account",
    //     ERROR.AUTH_NOT_ACTIVATED
    //   );
    // }

    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({ ...userDto });

    await tokenService.saveToken(userDto.id, tokens.refreshToken);
    return {
      ...tokens,
      user: userDto,
    };
  }
  async logout(refreshToken) {
    const token = await tokenService.removeToken(refreshToken);
    return token;
  }

  async refresh(refreshToken) {
    if (!refreshToken) {
      throw ApiError.Unauthorized(ERROR.AUTH_UNAUTHORIZED);
    }
    const userData = tokenService.validateRefreshToken(refreshToken);
    const tokenFromDB = await tokenService.findToken(refreshToken);
    if (!userData || !tokenFromDB) {
      throw ApiError.Unauthorized(ERROR.AUTH_UNAUTHORIZED);
    }
    const user = await UserModel.findById(userData.id);
    const userDto = new UserDto(user); // id, email, isActivated
    const tokens = tokenService.generateTokens({ ...userDto });
    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return {
      ...tokens,
      user: userDto,
    };
  }
  async getUsers() {
    const users = await UserModel.find();
    return users;
  }
}

module.exports = new UserService();
