const Joi = require('joi');

const ExportsPlaylistSchema = Joi.object({
  targetEmail: Joi.string().email({ tlds: { allow: true } }).required(),
});

module.exports = { ExportsPlaylistSchema };
