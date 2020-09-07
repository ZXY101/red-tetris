class Player {
	constructor(clientId, connection) {
		this.clientId = clientId;
		this.connection = connection;
		this.stageWidth = 12
		this.stageHeight = 20
		this.ti = setInterval(() => this.ping(), 3000);
		this.tm = null;
		this.opponent = null;
		this.stage = Array.from(Array(this.stageHeight), () =>
			new Array(this.stageWidth).fill([0, 'clear'])
		);
	}

	ping(){
		const payLoad = {
			method: "ping"
		}

		this.connection.send(JSON.stringify(payLoad));
		this.tm = setTimeout(() =>{
			this.clientDC();
		}, 5000);
	}

	clientDC() {
		const payLoad = {
			method: "playerLeft",
		}
		if (this.opponent){
			this.opponent.connection.send(JSON.stringify(payLoad));
		}
		clearInterval(this.ti)
		clearTimeout(this.tm);
	}

	pong(){
		clearTimeout(this.tm)
	}
}

module.exports.Player = Player