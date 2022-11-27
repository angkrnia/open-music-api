const Joi = require('joi');

const currentYear = new Date().getFullYear();
const AlbumsPayloadSchema = Joi.object({
  name: Joi.string().required(),
  year: Joi.number().integer().min(1900).max(currentYear)
    .required(),
});

const UploadImageHeadersSchema = Joi.object({
  'content-type': Joi.string().valid('image/apng', 'image/avif', 'image/gif', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp').required(),
}).unknown();

module.exports = { AlbumsPayloadSchema, UploadImageHeadersSchema };
