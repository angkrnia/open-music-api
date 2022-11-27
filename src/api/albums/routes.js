const path = require('path');

const routes = (handler) => [
  {
    path: '/albums',
    method: 'POST',
    handler: (request, h) => handler.postAlbum(request, h),
  },
  {
    path: '/albums/{id}',
    method: 'GET',
    handler: (request, h) => handler.getAlbumById(request, h),
  },
  {
    path: '/albums/{id}',
    method: 'PUT',
    handler: (request, h) => handler.putAlbumById(request, h),
  },
  {
    path: '/albums/{id}',
    method: 'DELETE',
    handler: (request, h) => handler.deleteAlbumById(request, h),
  },
  {
    method: 'POST',
    path: '/albums/{id}/covers',
    handler: (request, h) => handler.postAlbumCoverHandler(request, h),
    options: {
      payload: {
        allow: 'multipart/form-data',
        multipart: true,
        parse: true,
        output: 'stream',
        maxBytes: 512000,
      },
    },
  },
  {
    method: 'GET',
    path: '/albums/cover/{param*}',
    handler: {
      directory: {
        path: path.resolve(__dirname, '../../storage/albums'),
      },
    },
  },
  {
    method: 'POST',
    path: '/albums/{id}/likes',
    handler: (request, h) => handler.postAlbumLikeHandler(request, h),
    options: {
      auth: 'openmusic_jwt',
    },
  },
  {
    method: 'GET',
    path: '/albums/{id}/likes',
    handler: (request, h) => handler.getAlbumLikesHandler(request, h),
  },
];

module.exports = routes;
