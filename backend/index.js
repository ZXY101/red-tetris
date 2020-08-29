const http = require("http");
const {v4} = require("uuid");
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
				clients: [{clientId: clientId}],
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

			game.clients.push({
				"clientId": clientId,
			});

			const payLoad = {
				method: "join",
				game: game,
			}

			//Tell all clients that someone joined
			console.log(game);

			game.clients.forEach(c => {
				clients[c.clientId].connection.send(JSON.stringify(payLoad));
			});
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

