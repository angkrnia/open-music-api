const routes = require('./routes');
const ExportPlaylistHandler = require('./handler');

module.exports = {
  name: 'exports',
  version: '1.0.0',
  register: async (server, { exportsService, playlistsService, validator }) => {
    const exportPlaylistHandler = new ExportPlaylistHandler({ exportsService, playlistsService, validator });
    server.route(routes(exportPlaylistHandler));
  },
};
