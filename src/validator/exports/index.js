const { ExportsPlaylistSchema } = require('./schema');
const InvariantError = require('../../error/InvariantError');

const ExportsValidator = {
  validateExportPlaylistPayload: (payload) => {
    const validationResult = ExportsPlaylistSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = ExportsValidator;
