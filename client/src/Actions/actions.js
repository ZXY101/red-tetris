export const createGame = (ws, clientId) => {
	const payLoad = {
		method: "create",
		clientId: clientId,
	}
	ws.send(JSON.stringify(payLoad));
}