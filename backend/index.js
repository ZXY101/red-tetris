const http = require("http");
const {v4} = require("uuid");
const { client } = require("websocket");
const webSocketServer = require("websocket").server;
const httpServer = http.createServer();

httpServer.listen(9090, () => console.log("Listening.. on 9090"));

const clients = {};
const games = {};
let tm

const wsServer = new webSocketServer({
	"httpServer": httpServer,
});

wsServer.on("request", request => {
	const connection = request.accept(null, request.origin);
	connection.on("open", () => console.log("Opened!"));
	connection.on("close", () => console.log("Closed!"));
	connection.on("message", message => {
		const result = JSON.parse(message.utf8Data)

		if(result.method === "pong"){
			const clientId = result.clientId;
			pong(clientId)
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

			const con = clients[clientId].connection;
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

	const ti = setInterval(() => ping(clientId, ti), 3000);

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

function ping(clientId, ti){
	payLoad = {
		method: "ping"
	}

	clients[clientId].connection.send(JSON.stringify(payLoad));
	tm = setTimeout(() =>{
		clientDC(clientId, ti);
	}, 5000);
}




function pong(clientId) {
	clearTimeout(tm);
}

function clientDC(clientId, ti) {
	console.log('No response from ', clientId);

	for(const g of Object.keys(games)){
		const game = games[g];
		const payLoad = {
			method: "playerLeft",
		}

		games[g].clients.forEach(c => {
			if (clientId === c.clientId){
				games[g].clients.forEach(c => {
					clients[c.clientId].connection.send(JSON.stringify(payLoad));
				});
			}
		})
	}

	clearInterval(ti)
	clearTimeout(tm);
}
