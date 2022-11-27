/* eslint-disable no-console */
const ClientError = require('../../error/ClientError');

class playlistsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
  }

  async postPlaylistHandler(request, h) {
    this._validator.validatePostPlaylistSchema(request.payload);
    const { name } = request.payload;

    const { id: credentialId } = request.auth.credentials;
    const playlistId = await this._service.addPlaylist(name, credentialId);

    const response = h.response({
      status: 'success',
      message: 'Playlist berhasil ditambahkan',
      data: { playlistId },
    });

    response.code(201);
    return response;
  }

  async getPlaylistsHandler({ auth }, h) {
    const { id: userId } = auth.credentials;
    const playlists = await this._service.getPlaylists(userId);

    return {
      status: 'success',
      data: { playlists },
    };
  }

  async deletePlaylistHandler({ auth, params }, h) {
    const { playlistId } = params;
    const { id: credentialId } = auth.credentials;

    await this._service.verifyPlaylistOwner(playlistId, credentialId);
    await this._service.deletePlaylistById(playlistId);

    return {
      status: 'success',
      message: 'Playlist berhasil dihapus',
    };
  }

  async postSongToPlaylistHandler({ payload, auth, params }, h) {
    this._validator.validatePostSongToPlaylistSchema(payload);

    const { songId } = payload;
    const { playlistId } = params;
    const { id: userId } = auth.credentials;

    await this._service.verifyPlaylistAccess(playlistId, userId);
    await this._service.addSongToPlaylist(songId, playlistId);
    await this._service.addPlaylistActivities('add', { playlistId, userId, songId });

    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan ke playlist',
    });

    response.code(201);
    return response;
  }

  async getSongsFromPlaylistHandler({ params, auth }, h) {
    const { playlistId } = params;
    const { id: credentialId } = auth.credentials;

    await this._service.verifyPlaylistAccess(playlistId, credentialId);
    const playlist = await this._service.getPlaylistsById(playlistId);
    const songs = await this._service.getSongsInPlaylist(playlistId);

    return {
      status: 'success',
      data: {
        playlist: {
          ...playlist,
          songs,
        },
      },
    };
  }

  async deleteSongFromPlaylistHandler({ payload, params, auth }, h) {
    this._validator.validateDeleteSongFromPlaylistSchema(payload);

    const { playlistId } = params;
    const { songId } = payload;
    const { id: userId } = auth.credentials;

    await this._service.verifyPlaylistAccess(playlistId, userId);
    await this._service.deleteSongFromPlaylist(playlistId, songId);
    await this._service.addPlaylistActivities('delete', { playlistId, userId, songId });

    return {
      status: 'success',
      message: 'Lagu berhasil dihapus dari playlist',
    };
  }

  async getPlayistActivitiesHandler({ params, auth }, h) {
    const { playlistId } = params;
    const { id: userId } = auth.credentials;

    await this._service.verifyPlaylistAccess(playlistId, userId);
    const activities = await this._service.getActivitiesByPlaylistId(playlistId);

    return {
      status: 'success',
      data: {
        playlistId,
        activities,
      },
    };
  }
}

module.exports = playlistsHandler;
