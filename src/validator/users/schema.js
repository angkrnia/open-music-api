const Joi = require('joi');

const UserPayloadSchema = Joi.object({
  username: Joi.string().min(3).required(),
  password: Joi.string().min(3).required(),
  fullname: Joi.string().min(3).required(),
});

module.exports = { UserPayloadSchema };
