/* eslint-disable no-console */
const ClientError = require('../../error/ClientError');

class AuthenticationsHandler {
  constructor({
    authenticationsService, usersService, tokenManager, validator,
  }) {
    this._authenticationsService = authenticationsService;
    this._usersService = usersService;
    this._tokenManager = tokenManager;
    this._validator = validator;
  }

  async postAuthenticationHandler({ payload }, h) {
    this._validator.validatePostAuthenticationPayload(payload);

    const { username, password } = payload;
    const id = await this._usersService.verifyUserCrendential(username, password);

    const accessToken = await this._tokenManager.generateAccessToken({ id });
    const refreshToken = await this._tokenManager.generateRefreshToken({ id });

    await this._authenticationsService.addRefreshToken(refreshToken);

    const response = h.response({
      status: 'success',
      message: 'Autentikasi berhasil!',
      data: {
        accessToken,
        refreshToken,
      },
    });

    response.code(201);
    return response;
  }

  async putAuthenticationHandler({ payload }, h) {
    this._validator.validatePutAuthenticationPayload(payload);

    const { refreshToken } = payload;
    await this._authenticationsService.verifyRefreshToken(refreshToken);
    const { id } = await this._tokenManager.verifyRefreshToken(refreshToken);
    const accessToken = await this._tokenManager.generateAccessToken({ id });

    return {
      status: 'success',
      message: 'Access Token berhasil diperbarui',
      data: {
        accessToken,
      },
    };
  }

  async deleteAuthenticationHandler({ payload }, h) {
    this._validator.validateDeleteAuthenticationPayload(payload);

    const { refreshToken } = payload;
    await this._tokenManager.verifyRefreshToken(refreshToken);
    await this._authenticationsService.deleteRefreshToken(refreshToken);

    return {
      status: 'success',
      message: 'Refresh token berhasil dihapus',
    };
  }
}

module.exports = AuthenticationsHandler;
