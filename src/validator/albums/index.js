const InvariantError = require('../../error/InvariantError');
const { AlbumsPayloadSchema, UploadImageHeadersSchema } = require('./schema');

const AlbumsValidator = {
  validateAlbumPayload: (payload) => {
    const validationResult = AlbumsPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateUploadCoverHeadersSchema: (header) => {
    const validationResult = UploadImageHeadersSchema.validate(header);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = AlbumsValidator;
