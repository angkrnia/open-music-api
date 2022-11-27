/* eslint-disable no-console */
const ClientError = require('../../error/ClientError');

class UsersHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postUserHandler = this.postUserHandler.bind(this);
  }

  async postUserHandler({ payload }, h) {
    this._validator.validateUserPayload(payload);

    const userId = await this._service.addUser(payload);

    const response = h.response({
      status: 'success',
      data: {
        userId,
      },
    });

    response.code(201);
    return response;
  }
}

module.exports = UsersHandler;
