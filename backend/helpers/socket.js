const {v4} = require("uuid");
const {Player} = require("../classes/Player");
const {Game} = require("../classes/Game");
const {Piece} = require("../classes/Piece");

const clients = {};
const games = {};

exports.socket = (wsServer) =>{
	wsServer.on("request", request => {
		const connection = request.accept(null, request.origin);

		connection.on("message", message => {
			const result = JSON.parse(message.utf8Data)

			if(result.method === "pong"){
				const clientId = result.clientId;
				clients[clientId].player.pong()
			}

			if (result.method === "create"){
				const clientId = result.clientId;
				const gameId = v4();
				const url = `http://localhost:3000/?game=${gameId}`
				games[gameId] = {
					id: gameId,
					host: {clientId: clientId},
					clients: [{clientId: clientId, stage: []}],
				};

				const payLoad = {
					method: "create",
					url: url,
					game: games[gameId],
				};

				const con = clients[clientId].player.connection;
				con.send(JSON.stringify(payLoad));
			}

			if (result.method === "join"){
				const clientId = result.clientId;
				const gameId = result.gameId;
				const game = games[gameId];
				if(!game)
					return

				if (game.clients.length >= 2){
					const payLoad = {
						method: "gameFull",
						game: game,
					}
					clients[clientId].player.connection.send(JSON.stringify(payLoad));
					return;
				}

				game.clients.push({
					clientId: clientId,
					stage: result.stage
				});

				const payLoad = {
					method: "join",
					game: game,
				}

				game.clients.forEach(c => {
					clients[c.clientId].player.connection.send(JSON.stringify(payLoad));
				});

				clients[clientId].player.opponent = clients[game.host.clientId].player;
				clients[game.host.clientId].player.opponent = clients[clientId].player;
			}

			if (result.method === "start"){
				const gameId = result.gameId;
				const game = games[gameId];
				const stage = result.stage;

				game.clients.forEach(c => {
					c.stage = stage;
				});
				updateGameState(game);

				const payLoad = {
					method: "startGame",
					game: game,
				}
				game.clients.forEach(c => {
					clients[c.clientId].player.connection.send(JSON.stringify(payLoad));
				});
			}

			if (result.method === "updateStage"){
				const clientId = result.clientId;
				const gameId = result.gameId;
				const stage = result.stage;
				const game = games[gameId];
				if(!game)
					return

				game.clients.forEach(c => {
					if (c.clientId == clientId){
						c.stage = stage;
					}
				});
				games[gameId] = game;
			}

			if (result.method === "gameOver"){
				const clientId = result.clientId;
				const gameId = result.gameId;
				const game = games[gameId];

				
				const payLoad = {
					method: "gameEnded",
					loser: clientId,
				}
				
				game.clients.forEach(c => {
					clients[c.clientId].player.connection.send(JSON.stringify(payLoad));
				});
			}

		});
		
		const clientId = v4();
		const player = new Player(clientId, connection)

		clients[clientId] = {
			player: player,
		};

		const payLoad = {
			method: "connect",
			clientId: clientId,
		};

		connection.send(JSON.stringify(payLoad));
	});

	function updateGameState(game){
		const payLoad = {
			method: "update",
			game: game,
		}
		game.clients.forEach(c => {
			clients[c.clientId].player.connection.send(JSON.stringify(payLoad));
		})
		setTimeout(() => updateGameState(game), 500)
	}
}