const Joi = require('joi');

const payloadCollaborationSchema = Joi.object({
  playlistId: Joi.string().required(),
  userId: Joi.string().required(),
});

module.exports = payloadCollaborationSchema;
