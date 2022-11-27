const { Pool } = require('pg');
const NotFoundError = require('./error/NotFoundError');

class PlayistsService {
  constructor(cacheControl) {
    this._pool = new Pool();
    this._cacheControl = cacheControl;
  }

  async getPlaylistById(playlistId) {
    const query = {
      text: 'SELECT id, name FROM playlists WHERE id = $1',
      values: [playlistId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Failed, playlist ID not found!');
    }

    return result.rows[0];
  }

  async getSongsFromPlaylistId(playlistId) {
    try {
      const result = await this._cacheControl.get(`playlist:${playlistId}`);
      return JSON.parse(result);
    } catch {
      const query = {
        text: `
          SELECT songs.id, songs.title, songs.performer FROM songs
          LEFT JOIN playlistsongs ON songs.id = playlistsongs.song_id
          WHERE playlistsongs.playlist_id = $1
        `,
        values: [playlistId],
      };

      const result = await this._pool.query(query);
      const parseToJSON = JSON.stringify(result.rows);

      await this._cacheControl.set(`playlist:${playlistId}`, parseToJSON);

      return result.rows;
    }
  }
}

module.exports = PlayistsService;
