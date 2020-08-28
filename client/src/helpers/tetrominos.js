export const TETROMINOS = {
	0:{
		shape: [[0]],
		color: "#000",
	},
	I: {
		shape: [
			[0, 'I', 0, 0],
			[0, 'I', 0, 0],
			[0, 'I', 0, 0],
			[0, 'I', 0, 0],
		],
		color: "#00ffff",
	},
	J: {
		shape: [
			[0, 'J', 0],
			[0, 'J', 0],
			['J', 'J', 0],
		],
		color: "#0000a0",
	},
	L: {
		shape: [
			[0, 'L', 0],
			[0, 'L', 0],
			[0, 'L', 'L'],
		],
		color: "#ff8000",
	},
	O: {
		shape: [
			['O', 'O'],
			['O', 'O'],
		],
		color: "#ffff00",
	},
	S: {
		shape: [
			[0, 'S', 'S'],
			['S', 'S', 0],
			[0, 0, 0],
		],
		color: "#00ff00",
	},
	T: {
		shape: [
			[0, 0, 0],
			['T', 'T', 'T'],
			[0, 'T', 0],
		],
		color: "#8000ff",
	},
	Z: {
		shape: [
			['Z', 'Z', 0],
			[0, 'Z', 'Z'],
			[0, 0, 0],
		],
		color: "#ff0000",
	},
}

export const randomTetromino = () => {
	const tetrominos = "IJLOSTZ";
	const randTetromino = tetrominos[Math.floor(Math.random() * tetrominos.length)];
	return TETROMINOS[randTetromino]
}