const routes = require('./routes');
const CollaborationsHandler = require('./handler');

module.exports = {
  name: 'collaborations',
  version: '1.0.0',
  register: (server, {
    collaborationsService,
    playlistsService,
    usersService,
    validator,
  }) => {
    const collaborationsHandler = new CollaborationsHandler({
      collaborationsService,
      playlistsService,
      usersService,
      validator,
    });

    server.route(routes(collaborationsHandler));
  },
};
