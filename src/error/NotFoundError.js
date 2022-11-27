const CLientError = require('./ClientError');

class NotFoundError extends CLientError {
  constructor(message) {
    super(message, 404);
    this.name = 'Not Found Error';
  }
}

module.exports = NotFoundError;
