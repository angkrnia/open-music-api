const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const fs = require('fs');
const InvariantError = require('../error/InvariantError');
const NotFoundError = require('../error/NotFoundError');
const { mapAlbumToModel } = require('../utils/mapDBtoModel');

class AlbumsService {
  constructor({ coverUploadFolder, cacheControl }) {
    this._pool = new Pool();
    this._coverUploadFolder = coverUploadFolder;
    this._cacheControl = cacheControl;

    if (!fs.existsSync(coverUploadFolder)) {
      fs.mkdirSync(coverUploadFolder, { recursive: true });
    }
  }

  async addAlbum({ name, year }) {
    const id = nanoid(16);
    const query = {
      text: 'INSERT INTO albums VALUES ($1, $2, $3, $4) RETURNING id',
      values: [`album-${id}`, name, year, undefined],
    };

    const { rows } = await this._pool.query(query);
    if (!rows[0].id) {
      throw new InvariantError('Failed to added album');
    }

    return rows[0].id;
  }

  async getAlbums() {
    const { rows } = this._pool.query('SELECT * FROM albums WHERE title LIKE ');
    return rows;
  }

  async getAlbumById(id) {
    const query = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id],
    };

    const { rows, rowCount } = await this._pool.query(query);
    if (!rowCount) {
      throw new NotFoundError('Cannot find album ID!');
    }

    return rows.map(mapAlbumToModel)[0];
  }

  async getAlbumByIdWithSongs(id) {
    const query = {
      text: `
        SELECT songs.id, songs.title, songs.performer FROM albums
        LEFT JOIN songs ON songs.album_id = albums.id
        WHERE albums.id = $1`,
      values: [id],
    };

    const { rows, rowCount } = await this._pool.query(query);
    if (!rowCount) {
      throw new NotFoundError('Cannot find album ID!');
    }

    return rows;
  }

  async editAlbumById(id, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3',
      values: [name, year, id],
    };

    const { rowCount } = await this._pool.query(query);
    if (!rowCount) {
      throw new NotFoundError('Cannot find album ID!');
    }
  }

  async editAlbumCoverById(id, filename) {
    const query = {
      text: 'UPDATE albums SET cover = $1 WHERE id = $2',
      values: [filename, id],
    };

    const { rowCount } = await this._pool.query(query);
    if (!rowCount) {
      throw new NotFoundError('Cannot find album ID!');
    }
  }

  async _verifyExistAlbumById(id) {
    const query = {
      text: 'SELECT id FROM albums WHERE id = $1',
      values: [id],
    };

    const { rowCount } = await this._pool.query(query);
    if (!rowCount) {
      throw new NotFoundError('Album ID not found!');
    }
  }

  async verifyExistAlbumLikeStatusById(albumId, userId) {
    await this._verifyExistAlbumById(albumId);
    const query = {
      text: 'SELECT * FROM user_album_likes WHERE album_id = $1 AND user_id = $2',
      values: [albumId, userId],
    };

    const { rowCount } = await this._pool.query(query);
    return rowCount;
  }

  async deleteAlbumLikeStatusById(albumId, userId) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE album_id = $1 AND user_id = $2',
      values: [albumId, userId],
    };

    const { rowCount } = await this._pool.query(query);
    if (!rowCount) {
      throw new NotFoundError('Cannot find album & user ID!');
    }

    await this._cacheControl.del(`album:like:${albumId}`);
  }

  async addAlbumLikeStatus(albumId, userId) {
    const id = `like-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO user_album_likes VALUES ($1, $2, $3)',
      values: [id, userId, albumId],
    };

    const { rowCount } = await this._pool.query(query);
    if (!rowCount) {
      throw new InvariantError('Cannot like album ID!');
    }

    await this._cacheControl.del(`album:like:${albumId}`);
  }

  async deleteAlbumById(id) {
    const { cover } = await this.getAlbumById(id);
    const query = {
      text: 'DELETE FROM albums WHERE id = $1',
      values: [id],
    };

    const { rowCount } = await this._pool.query(query);
    if (!rowCount) {
      throw new NotFoundError('Cannot find album ID!');
    }

    if (cover) {
      fs.unlink(`${this._coverUploadFolder}/${cover}`);
    }

    await this._cacheControl.del('albums');
  }

  async getAlbumLikesCountByAlbumId(albumId) {
    try {
      const likeCounts = await this._cacheControl.get(`album:like:${albumId}`);
      return {
        count: JSON.parse(likeCounts),
        isCache: true,
      };
    } catch {
      const query = {
        text: 'SELECT user_id FROM user_album_likes WHERE album_id = $1',
        values: [albumId],
      };

      const { rowCount } = await this._pool.query(query);

      if (!rowCount) {
        throw new NotFoundError('Cannot find album ID!');
      }
      await this._cacheControl.set(
        `album:like:${albumId}`,
        JSON.stringify(rowCount),
      );

      return {
        count: rowCount,
        isCache: false,
      };
    }
  }

  async uploadCover(file) {
    const filename = `cover-${nanoid(5)}-${file.hapi.filename}`;
    const directory = `${this._coverUploadFolder}/${filename}`;
    const fileStream = fs.createWriteStream(directory);

    return new Promise((resolve, reject) => {
      fileStream.on('error', (error) => reject(error));
      file.pipe(fileStream);
      file.on('end', () => resolve(filename));
    });
  }
}

module.exports = AlbumsService;
