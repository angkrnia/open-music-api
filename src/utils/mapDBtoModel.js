/* eslint-disable camelcase */
const mapGetSongs = ({
  id, title, year, performer, genre, duration, album_id,
}) => ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  albumId: album_id,
});

const mapAlbumToModel = ({
  id,
  name,
  year,
  cover,
}) => ({
  id,
  name,
  year,
  coverUrl: cover ? `http://${process.env.HOST}:${process.env.PORT}/albums/cover/${cover}` : null,
});

module.exports = { mapGetSongs, mapAlbumToModel };
