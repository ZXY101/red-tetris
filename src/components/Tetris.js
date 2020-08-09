import React, {useState} from 'react'

import {createStage, checkCollision} from '../helpers/gameHelpers'
import {StyledTetrisWrapper} from './styles/StyledTetris'
import {StyledTetris} from './styles/StyledTetris'

import {useGameStatus} from '../hooks/useGameStatus'
import {useInterval} from '../hooks/useInterval'
import {usePlayer} from "../hooks/usePlayer"
import {useStage} from "../hooks/useStage"

import Stage from './Stage'
import Display from './Display'
import StartButton from './StartButton'

export default function Tetris() {
	const [dropTime, setDropTime] = useState(null);
	const [gameOver, setGameOver] = useState(false);

	const [player, updatePlayerPos, resetPlayer, playerRotate] = usePlayer();
	const [stage, setStage, rowsCleared] = useStage(player, resetPlayer);
	const [score, setScore, rows, setRows, level, setLevel] = useGameStatus(rowsCleared)

	const movePlayer = (dir) =>{
		if (!checkCollision(player, stage, {x: dir, y: 0}))
			updatePlayerPos({x: dir, y: 0});
	}

	const startGame = () => {
		setStage(createStage());
		setDropTime(1000);
		resetPlayer();
		setGameOver(false);
		setScore(0);
		setRows(0);
		setLevel(0);
	}
	
	const drop = () => {
		if (rows > (level + 1) * 10){
			setLevel(prev => prev + 1)
			setDropTime(1000 / (level + 1) + 200)
		}

		if (!checkCollision(player, stage, {x: 0, y: 1})){
			updatePlayerPos({x: 0, y: 1, collided: false})
		} else {
			if (player.pos.y < 1){
				setGameOver(true);
				setDropTime(null);
			}
			updatePlayerPos({x: 0, y: 0, collided: true})
		}
	}

	const dropPlayer = () => {
		setDropTime(null);
		drop();
	}

	const keyUp = ({keyCode}) => {
		if (!gameOver){
			if (keyCode === 40){
				setDropTime(1000 / (level + 1) + 200)
			}
		}
	}

	const move = ({keyCode}) => {
		if (!gameOver){
			switch (keyCode){
				case 65:
				case 37:
					movePlayer(-1);
					break;
				case 68:
				case 39:
					movePlayer(1);
					break;
				case 83:
				case 40:
					dropPlayer();
					break;
				case 69:
				case 34:
				case 38:
					playerRotate(stage, 1);
					break;
				case 81:
				case 46:
					playerRotate(stage, -1);
					break;
			}
		}
	}

	useInterval (() => {
		drop();
	}, dropTime)

	return (
		<StyledTetrisWrapper role="button" tabIndex="0" onKeyDown={e => move(e)} onKeyUp={keyUp}>
			<StyledTetris>
				<Stage stage={stage}/>
				<aside>
					{gameOver ? (
						<Display gameOver={gameOver} text="Game Over"/>
					) :
						<div>
							<Display text={`Score: ${score}`}/>
							<Display text={`Rows: ${rows}`}/>
							<Display text={`Level: ${level}`}/>
						</div>
					}
					<StartButton callBack={startGame}/>
				</aside>
			</StyledTetris>
		</StyledTetrisWrapper>
	)
}
