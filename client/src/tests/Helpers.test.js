import {checkCollision, createStage} from "../helpers/gameHelpers";
import {TETROMINOS, randomTetromino} from "../helpers/tetrominos";

it("creates a new stage", () => {
	const STAGE_WIDTH = 12
	const STAGE_HEIGHT = 20
	const stage = Array.from(Array(STAGE_HEIGHT), () => new Array(STAGE_WIDTH).fill([0, 'clear']));

	expect(createStage()).toEqual(stage);
});

it("checks collisions", () => {
	const stage = createStage();
	const player = {
		pos: {x: 0, y: 0},
		tetromino: TETROMINOS["L"].shape,
		collided: false,
	}
	expect(checkCollision(player, stage, {x: 1, y: 1})).toBeUndefined();
});

it("returns a random tetrominos", () => {
	expect(randomTetromino()).toEqual(expect.anything());
});
