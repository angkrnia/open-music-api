const routes = require('./routes');
const AuthenticationsHandler = require('./handler');

module.exports = {
  name: 'authentications',
  version: '1.0.0',
  register: (server, {
    authenticationsService,
    usersService,
    tokenManager,
    validator,
  }) => {
    const authenticationsHandler = new AuthenticationsHandler({
      authenticationsService,
      usersService,
      tokenManager,
      validator,
    });

    server.route(routes(authenticationsHandler));
  },
};
