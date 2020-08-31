const http = require("http");
const {v4} = require("uuid");
const { client } = require("websocket");
const webSocketServer = require("websocket").server;
const httpServer = http.createServer();

httpServer.listen(9090, () => console.log("Listening.. on 9090"));

const clients = {};
const games = {};

const wsServer = new webSocketServer({
	"httpServer": httpServer,
});

wsServer.on("request", request => {
	const connection = request.accept(null, request.origin);
	connection.on("open", () => console.log("Opened!"));
	connection.on("close", () => console.log("Closed!"));

	connection.on("message", message => {
		const result = JSON.parse(message.utf8Data)

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

			console.log(`Game ${gameId} created by ${clientId}`);
			
			const con = clients[clientId].connection;
			con.send(JSON.stringify(payLoad));
		}

		if (result.method === "join"){
			const clientId = result.clientId;
			const gameId = result.gameId;
			const game = games[gameId];

			if (game.clients.length >= 2){
				const payLoad = {
					method: "gameFull",
					game: game,
				}
				clients[clientId].connection.send(JSON.stringify(payLoad));
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

			//Tell all clients that someone joined
			game.clients.forEach(c => {
				clients[c.clientId].connection.send(JSON.stringify(payLoad));
			});
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
				clients[c.clientId].connection.send(JSON.stringify(payLoad));
			});
			
			console.log('Game Started: \n', game);
			
		}

		if (result.method === "updateStage"){
			const clientId = result.clientId;
			const gameId = result.gameId;
			const stage = result.stage;
			const game = games[gameId];

			game.clients.forEach(c => {
				if (c.clientId == clientId){
					c.stage = stage;
				}
			});
			games[gameId] = game;
		}

	});
	// Generate new clientId
	const clientId = v4();
	clients[clientId] = {
		connection: connection,
	};

	const payLoad = {
		method: "connect",
		clientId: clientId,
	};

	// Send back client connect
	connection.send(JSON.stringify(payLoad));
});

function updateGameState(game){
	const payLoad = {
		method: "update",
		game: game,
	}

	game.clients.forEach(c => {
		clients[c.clientId].connection.send(JSON.stringify(payLoad));
	})
	setTimeout(() => updateGameState(game), 500)
}

