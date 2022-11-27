class ExportPlaylistHandler {
  constructor({ exportsService, playlistsService, validator }) {
    this._exportsService = exportsService;
    this._playlistsService = playlistsService;
    this._validator = validator;
  }

  async postExportPlaylistHandler(request, h) {
    this._validator.validateExportPlaylistPayload(request.payload);

    const { id: credentialId } = request.auth.credentials;
    const { playlistId } = request.params;
    const { targetEmail } = request.payload;

    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);

    const message = {
      playlistId,
      owner: credentialId,
      targetEmail,
    };

    await this._exportsService.sendMessage('export:playlist', JSON.stringify(message));

    const response = h.response({
      status: 'success',
      message: 'Permintaan Anda dalam antrean',
    });

    response.code(201);
    return response;
  }
}

module.exports = ExportPlaylistHandler;
