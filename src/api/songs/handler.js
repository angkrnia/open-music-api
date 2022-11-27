/* eslint-disable no-console */
const ClientError = require('../../error/ClientError');

class SongsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postSongHandler = this.postSongHandler.bind(this);
    this.getSongsHandler = this.getSongsHandler.bind(this);
    this.getSongByIdHandler = this.getSongByIdHandler.bind(this);
    this.putSongByIdHandler = this.putSongByIdHandler.bind(this);
    this.deleteSongByIdHandler = this.deleteSongByIdHandler.bind(this);
  }

  async postSongHandler(request, h) {
    this._validator.validateSongPayload(request.payload);

    const songId = await this._service.addSongs(request.payload);

    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan',
      data: { songId },
    });

    response.code(201);
    return response;
  }

  async getSongsHandler({ query }, h) {
    const { title = '', performer = '' } = query;
    const songs = await this._service.getSongs({ title, performer });

    return {
      status: 'success',
      data: {
        songs,
      },
    };
  }

  async getSongByIdHandler({ params }, h) {
    const { songId } = params;

    const song = await this._service.getSongById(songId);

    return {
      status: 'success',
      data: {
        song,
      },
    };
  }

  async putSongByIdHandler({ payload, params }, h) {
    this._validator.validateSongPayload(payload);
    const { songId } = params;

    await this._service.editSongById(songId, payload);

    return {
      status: 'success',
      message: 'song has been updated!',
    };
  }

  async deleteSongByIdHandler({ params }, h) {
    const { songId } = params;
    await this._service.deleteSongById(songId);

    return {
      status: 'success',
      message: 'song has been deleted!',
    };
  }
}

module.exports = SongsHandler;
