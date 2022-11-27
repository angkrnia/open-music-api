const InvariantError = require('../../error/InvariantError');
const {
  postPlaylistSchema, postSongToPlaylistSchema, deleteSongFromPlaylistSchema,
} = require('./schema');

const playlistsValidator = {
  validatePostPlaylistSchema: (payload) => {
    const validationResult = postPlaylistSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validatePostSongToPlaylistSchema: (payload) => {
    const validationResult = postSongToPlaylistSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateDeleteSongFromPlaylistSchema: (payload) => {
    const validationResult = deleteSongFromPlaylistSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = playlistsValidator;
