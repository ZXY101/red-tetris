import React, {useState, useEffect, Fragment} from 'react'

import {createStage, checkCollision} from '../helpers/gameHelpers'
import {StyledTetrisWrapper} from './styles/StyledTetris'
import {StyledTetris} from './styles/StyledTetris'

import {createGame} from '../Actions/actions'
import {useGameStatus} from '../hooks/useGameStatus'
import {useInterval} from '../hooks/useInterval'
import {usePlayer} from "../hooks/usePlayer"
import {useStage} from "../hooks/useStage"

import Stage from './Stage'
import Display from './Display'
import StartButton from './StartButton'
import Home from './Home'


export default function Tetris() {
	const ws = new WebSocket("ws://localhost:9090");
	const [clientId, setclientId] = useState(null);
	const [gameId, setgameId] = useState(null);
	const [gameCreated, setgameCreated] = useState(false);

	const [dropTime, setDropTime] = useState(null);
	const [gameOver, setGameOver] = useState(false);

	const [player, updatePlayerPos, resetPlayer, playerRotate, playerFall] = usePlayer();
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
		playerFall(stage, player, checkCollision);
		updatePlayerPos({x: 0, y: 0, collided: true})
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
				default:
					return;
			}
		}
	}

	useInterval (() => {
		drop();
	}, dropTime)

	useEffect(() => {
		ws.onmessage = message => {
			const response = JSON.parse(message.data);
			if (response.method === "connect"){
				setclientId(response.clientId);
				console.log('Client ID set successfully ' + response.clientId);
			}

			if (response.method === "create"){
				setgameId(response.game.id);
				setgameCreated(true);
				console.log('Game successfully created ' + response.game.id);
			}
		};
	}, [ws.onmessage])

	return (
		<Fragment>
			{!gameCreated ?
			<Home ws={ws} clientId={clientId} createGame={createGame}/> :
			<StyledTetrisWrapper role="button" tabIndex="0" onKeyDown={e => move(e)} onKeyUp={keyUp}>
				<StyledTetris>
					<Stage stage={stage}/>
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
	}
		</Fragment>
		)
}
