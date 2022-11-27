const routes = require('./routes');
const AlbumsHandler = require('./handler');

module.exports = {
  name: 'albums',
  version: '1.0',
  register: (server, {
    service,
    validator,
  }) => {
    const albumsHandler = new AlbumsHandler({
      service,
      validator,
    });

    server.route(routes(albumsHandler));
  },
};
