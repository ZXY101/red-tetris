const http = require("http");
const {socket} = require("./helpers/socket");
const httpServer = http.createServer();
const webSocketServer = require("websocket").server;

httpServer.listen(9090, () => console.log("Listening.. on 9090"));

const wsServer = new webSocketServer({
	"httpServer": httpServer,
});

socket(wsServer)