const CLientError = require('./ClientError');

class InvariantError extends CLientError {
  constructor(message) {
    super(message);
    this.name = 'Invariant Error';
  }
}

module.exports = InvariantError;
