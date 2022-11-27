const payloadCollaborationSchema = require('./schema');
const InvariantError = require('../../error/InvariantError');

const collaborationValidator = {
  validateCollaborationSchema: (payload) => {
    const validationResult = payloadCollaborationSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = collaborationValidator;
