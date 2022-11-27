/* eslint-disable no-console */
const ClientError = require('../../error/ClientError');

class AlbumsHandler {
  constructor({ service, validator }) {
    this._albumsService = service;
    this._validator = validator;
  }

  async postAlbum(request, h) {
    this._validator.validateAlbumPayload(request.payload);

    const albumId = await this._albumsService.addAlbum(request.payload);

    const response = h.response({
      status: 'success',
      message: 'Album has beed added!',
      data: {
        albumId,
      },
    });
    response.code(201);
    return response;
  }

  async getAlbumById(request, h) {
    const { id } = request.params;
    const album = await this._albumsService.getAlbumById(id);
    const songs = await this._albumsService.getAlbumByIdWithSongs(id);

    return {
      status: 'success',
      data: {
        album: {
          ...album,
          songs,
        },
      },
    };
  }

  async putAlbumById(request, h) {
    this._validator.validateAlbumPayload(request.payload);

    const { name, year } = request.payload;
    const { id } = request.params;

    await this._albumsService.editAlbumById(id, { name, year });

    return {
      status: 'success',
      message: 'Album has beed updated!',
    };
  }

  async deleteAlbumById(request, h) {
    const { id } = request.params;

    await this._albumsService.deleteAlbumById(id);

    return {
      status: 'success',
      message: 'Album has beed deleted!',
    };
  }

  async postAlbumCoverHandler({ payload, params }, h) {
    const { cover } = payload;
    const { id } = params;

    this._validator.validateUploadCoverHeadersSchema(cover.hapi.headers);
    const filename = await this._albumsService.uploadCover(cover);
    await this._albumsService.editAlbumCoverById(id, filename);

    const response = h.response({
      status: 'success',
      message: 'Sampul berhasil diunggah',
    });

    response.code(201);
    return response;
  }

  async postAlbumLikeHandler({ params, auth }, h) {
    const { id } = params;
    const { id: userId } = auth.credentials;

    const isAlbumsLike = await this._albumsService.verifyExistAlbumLikeStatusById(id, userId);
    if (isAlbumsLike > 0) {
      await this._albumsService.deleteAlbumLikeStatusById(id, userId);
      const response = h.response({
        status: 'success',
        message: 'Berhasil melakukan dislike pada album!',
      });
      response.code(201);
      return response;
    }
    await this._albumsService.addAlbumLikeStatus(id, userId);

    const response = h.response({
      status: 'success',
      message: 'Berhasil menyukai album!',
    });
    response.code(201);
    return response;
  }

  async getAlbumLikesHandler({ params }, h) {
    const { id } = params;
    const { count, isCache } = await this._albumsService.getAlbumLikesCountByAlbumId(id);

    const response = {
      status: 'success',
      data: { likes: count },
    };

    if (isCache) {
      return h.response(response).header('X-Data-Source', 'cache');
    }

    return response;
  }
}

module.exports = AlbumsHandler;
