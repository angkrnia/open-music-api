exports.up = (pgm) => {
  pgm.createTable('songs', {
    id: {
      type: 'VARCHAR(60)',
      primaryKey: true,
    },
    title: {
      type: 'VARCHAR(300)',
      notNull: true,
    },
    year: {
      type: 'INT',
      notNull: true,
    },
    performer: {
      type: 'TEXT',
      notNull: true,
    },
    genre: {
      type: 'TEXT',
      notNull: true,
    },
    duration: {
      type: 'INT',
    },
    album_id: {
      type: 'TEXT',
    },
  });
  pgm.addConstraint('songs', 'fk_songs.album_id_albums.id', 'FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  pgm.dropTable('songs');
};
