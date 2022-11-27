class Listener {
  constructor(playistsService, mailSender) {
    this._playistsService = playistsService;
    this._mailSender = mailSender;

    this.eventListener = this.eventListener.bind(this);
  }

  async eventListener(message) {
    try {
      const { playlistId, targetEmail } = JSON.parse(message.content.toString());
      const songs = await this._playistsService.getSongsFromPlaylistId(playlistId);
      const playlist = await this._playistsService.getPlaylistById(playlistId);
      await this._mailSender.sendEmail(targetEmail, JSON.stringify({
        playlist: {
          ...playlist,
          songs,
        },
      }));
    } catch (error) {
      console.error(error);
    }
  }
}

module.exports = Listener;
