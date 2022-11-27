const Joi = require('joi');

const postPlaylistSchema = Joi.object({
  name: Joi.string().required(),
});

const postSongToPlaylistSchema = Joi.object({
  songId: Joi.string().required(),
});

const deleteSongFromPlaylistSchema = Joi.object({
  songId: Joi.string().required(),
});

module.exports = {
  postPlaylistSchema,
  postSongToPlaylistSchema,
  deleteSongFromPlaylistSchema,
};
