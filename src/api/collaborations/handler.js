/* eslint-disable no-console */
const ClientError = require('../../error/ClientError');

class collaborationsHandler {
  constructor({
    collaborationsService, playlistsService, usersService, validator,
  }) {
    this._collaborationsService = collaborationsService;
    this._playlistsService = playlistsService;
    this._usersServices = usersService;
    this._validator = validator;
  }

  async postCollaborationHandler({ payload, auth }, h) {
    this._validator.validateCollaborationSchema(payload);

    const { id: credentialId } = auth.credentials;
    const { playlistId, userId } = payload;

    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);
    await this._usersServices.verifyExistingUserWithUserId(userId);
    const collaborationId = await this._collaborationsService.addCollaboration(playlistId, userId);

    const response = h.response({
      status: 'success',
      message: 'Kolaborasi berhasil ditambahkan',
      data: {
        collaborationId,
      },
    });

    response.code(201);
    return response;
  }

  async deleteCollaborationHandler({ payload, auth }, h) {
    this._validator.validateCollaborationSchema(payload);

    const { id: credentialId } = auth.credentials;
    const { playlistId, userId } = payload;

    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);
    await this._collaborationsService.deleteCollaboration(playlistId, userId);

    return {
      status: 'success',
      message: 'Kolaborasi berhasil dihapus',
    };
  }
}

module.exports = collaborationsHandler;
