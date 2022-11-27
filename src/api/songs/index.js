const routes = require('./routes');
const SongsHandler = require('./handler');

const createPlugin = {
  name: 'songs',
  version: '1.0',
  register: (server, { service, validator }) => {
    const songsHandler = new SongsHandler(service, validator);
    server.route(routes(songsHandler));
  },
};

module.exports = createPlugin;
