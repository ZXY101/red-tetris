class Game {
	constructor(gameId, gameUrl, host, clients) {
		this.gameId = gameId;
		this.gameUrl = gameUrl;
		this.host = host;
		this.clients = clients;
	}
}
module.exports.Game = Game