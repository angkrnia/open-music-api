const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const { mapGetSongs } = require('../utils/mapDBtoModel');
const InvariantError = require('../error/InvariantError');
const NotFoundError = require('../error/NotFoundError');
const AuthorizationError = require('../error/AuthorizationError');

class PlaylistsService {
  constructor({ collaborationsService, songsService }) {
    this._pool = new Pool();
    this._collaborationsService = collaborationsService;
    this._songsService = songsService;
  }

  async addPlaylist(name, owner) {
    const id = `playlist-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlists VALUES ($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };

    const { rows } = await this._pool.query(query);

    if (!rows[0].id) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }

    return rows[0].id;
  }

  async getPlaylists(owner) {
    const query = {
      text: `SELECT playlists.id, playlists.name, users.username
      FROM playlists
      LEFT JOIN users ON users.id = playlists.owner
      LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id
      WHERE playlists.owner = $1 OR collaborations.user_id = $1`,
      values: [owner],
    };

    const { rows } = await this._pool.query(query);
    return rows;
  }

  async getPlaylistsById(id) {
    const query = {
      text: `
        SELECT playlists.id,   playlists.name, users.username FROM playlists
        LEFT JOIN users ON users.id = playlists.owner
        WHERE playlists.id = $1
      `,
      values: [id],
    };

    const { rows } = await this._pool.query(query);

    if (!rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    return rows[0];
  }

  async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1',
      values: [id],
    };

    const { rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan');
    }
  }

  async addSongToPlaylist(songId, playlistId) {
    await this._songsService.verifySongId(songId);

    const id = `playlistsong-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlistsongs VALUES ($1, $2, $3)',
      values: [id, playlistId, songId],
    };

    const { rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new InvariantError('Lagu gagal ditambahkan ke playlist');
    }
  }

  async getSongsInPlaylist(playlistId) {
    const query = {
      text: `SELECT songs.id, songs.title, songs.performer
        FROM playlistsongs
        INNER JOIN songs ON songs.id = playlistsongs.song_id 
        WHERE playlistsongs.playlist_id = $1
        GROUP BY songs.id`,
      values: [playlistId],
    };

    const { rows } = await this._pool.query(query);

    return rows.map(mapGetSongs);
  }

  async deleteSongFromPlaylist(playlistId, songId) {
    const query = {
      text: 'DELETE FROM playlistsongs WHERE song_id = $1 AND playlist_id = $2',
      values: [songId, playlistId],
    };

    const { rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new NotFoundError('Lagu gagal dihapus dari playlist. Id tidak ditemukan');
    }
  }

  async addPlaylistActivities(action, { playlistId, userId, songId }) {
    const id = `history-${nanoid(16)}`;
    const currentTime = new Date().toISOString();

    const query = {
      text: 'INSERT INTO playlistactivities VALUES ($1, $2, $3, $4, $5, $6)',
      values: [id, playlistId, songId, userId, action, currentTime],
    };

    const { rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new InvariantError('Playlist gagal ditambahkan ke daftar aktivitas');
    }
  }

  async getActivitiesByPlaylistId(playlistId) {
    const query = {
      text: `
        SELECT users.username, songs.title, playlistactivities.action, playlistactivities.time FROM playlistactivities
        INNER JOIN users ON users.id = playlistactivities.user_id
        INNER JOIN songs ON songs.id = playlistactivities.song_id
        WHERE playlistactivities.playlist_id = $1
      `,
      values: [playlistId],
    };

    const { rows } = await this._pool.query(query);

    if (!rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }
    return rows;
  }

  async verifyPlaylistOwner(playlistId, owner) {
    const query = {
      text: 'SELECT id, owner FROM playlists WHERE id = $1',
      values: [playlistId],
    };

    const { rows } = await this._pool.query(query);

    if (!rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    const playlist = rows[0];

    if (playlist.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      try {
        await this._collaborationsService.verifyCollaborator(playlistId, userId);
      } catch {
        throw error;
      }
    }
  }
}

module.exports = PlaylistsService;
