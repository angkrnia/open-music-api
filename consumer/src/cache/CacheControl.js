const redis = require('redis');
const InvariantError = require('../error/InvariantError');

class CacheControl {
  constructor() {
    this._client = redis.createClient({
      socket: {
        host: process.env.REDIS_SERVER,
      },
    });

    this._client.on('error', (error) => {
      throw new InvariantError(error);
    });

    this._client.connect();
  }

  async set(key, value, expInSec = 900) {
    await this._client.set(key, value, {
      EX: expInSec,
    });
  }

  async get(key) {
    const result = await this._client.get(key);
    if (!result) throw new Error('Cache not found');
  }

  del(key) {
    return this._client.del(key);
  }
}

module.exports = CacheControl;
