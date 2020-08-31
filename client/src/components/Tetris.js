import React, {useState, useEffect, useRef, Fragment} from 'react'

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

export default function Tetris({ws}) {

	const [clientId, setclientId] = useState("");
	const [gameId, setgameId] = useState("");
	const [gameUrl, setgameUrl] = useState("");
	const [host, sethost] = useState("");
	const [gameCreated, setgameCreated] = useState(false);
	const [players, setplayers] = useState(1);
	const [gameFull, setgameFull] = useState(false);
	
	const [dropTime, setDropTime] = useState(null);
	const [gameOver, setGameOver] = useState(false);
	
	const [player, updatePlayerPos, resetPlayer, playerRotate, playerFall] = usePlayer();
	const [stage, setStage, rowsCleared] = useStage(player, resetPlayer);
	const [score, setScore, rows, setRows, level, setLevel] = useGameStatus(rowsCleared)
	const [mainStage, setmainStage] = useState(stage);
	const [otherStage, setotherStage] = useState(stage);

	const movePlayer = (dir) =>{
		if (!checkCollision(player, stage, {x: dir, y: 0}))
			updatePlayerPos({x: dir, y: 0});
	}

	const startGame = (asHost) => {
		setStage(createStage());
		setDropTime(1000);
		resetPlayer();
		setGameOver(false);
		setScore(0);
		setRows(0);
		setLevel(0);

		if (asHost){
			const payLoad = {
				method: "start",
				clientId: clientId,
				gameId: gameId,
				stage: stage,
			};
			ws.send(JSON.stringify(payLoad));
		}

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
				setgameUrl(response.url);
				sethost(response.game.host);
				console.log('Game successfully created ' + response.game.id);
				console.log('Game successfully created ' + response.url);
			}

			if (response.method === "join"){
				setgameCreated(true);
				setplayers(players => players + 1)
				console.log('Player 2 Joined Game: ' + response.game.id);
			}

			if (response.method === "update"){
				const game = response.game;

				if (clientId === host.clientId){
					game.clients.forEach(c => {
						if (c.clientId !== clientId){
							setotherStage(c.stage);
						}
					});
				}else{
					game.clients.forEach(c => {
						if (c.clientId !== clientId){
							setmainStage(c.stage);
						}
					});
				}
			}

			if (response.method === "startGame" && clientId !== host.clientId){
				setStage(createStage());
				setDropTime(1000);
				resetPlayer();
				setGameOver(false);
				setScore(0);
				setRows(0);
				setLevel(0);
			}

			if (response.method === "gameFull"){
				console.log('Game is already full!');
				setgameFull(true);
			}
		};
	}, [ws.onmessage, host, clientId, setStage, setDropTime, resetPlayer, setGameOver, setScore, setRows,setLevel])

	useEffect(() => {
		
		const search = window.location.search;
		const params = new URLSearchParams(search);
		const id = params.get('game');
		setgameId(id);

		if (id && clientId){
			// ws.onopen = function() {
				const payLoad = {
					method: "join",
					clientId: clientId,
					gameId: id,
					stage: createStage(),
				};
				ws.send(JSON.stringify(payLoad));
			// }
		}
	}, [clientId, ws])

	useEffect(() => {
		if (clientId && gameId){
			const payLoad = {
				method: "updateStage",
				clientId: clientId,
				gameId: gameId,
				stage: stage,
			};
			ws.send(JSON.stringify(payLoad));
		}
	}, [stage, clientId, gameId, ws])

	const [copySuccess, setCopySuccess] = useState('');
	const textAreaRef = useRef(null);

	const copyToClipboard = (e) => {
		textAreaRef.current.select();
		document.execCommand('copy');
		// This is just personal preference.
		// I prefer to not show the whole text area selected.
		e.target.focus();
		setCopySuccess('Copied!');
	};


	return (
		<Fragment>
			{!gameCreated ?
			<Home ws={ws} clientId={clientId} createGame={createGame} gameFull={gameFull}/> :
			<StyledTetrisWrapper role="button" tabIndex="0" onKeyDown={e => move(e)} onKeyUp={keyUp}>
				<div className="nes-container is-rounded is-centered" style={{margin: "10px"}}>
					<StyledTetris>
						<Stage stage={clientId === host.clientId ? stage : mainStage} player={1}/>
						{players > 1 ? <Stage stage={clientId === host.clientId ? otherStage : stage} player={2}/> : 
						document.queryCommandSupported('copy') &&
						<div className="nes-container is-rounded is-centered">
							<label htmlFor="name_field">Multiplayer Link</label>
							<div className="nes-field is-inline" style={{margin: "10px"}}>
								<input type="text" id="name_field"  ref={textAreaRef} className="nes-input" defaultValue={gameUrl}/>
								<button type="button" className="nes-btn is-primary" onClick={copyToClipboard} >Copy</button> 
							</div>
							{copySuccess}
						</div>}
						<aside>
							{gameOver ? (
								<Display gameOver={gameOver} text="Game Over"/>
								) : null
							}
								<div>
									<Display text={`Score: ${score}`}/>
									<Display text={`Rows: ${rows}`}/>
									<Display text={`Level: ${level}`}/>
								</div>
							{clientId === host.clientId ? <StartButton callBack={()=>startGame(true)}/> : null}
						</aside>
					</StyledTetris>
				</div>
			</StyledTetrisWrapper>
	}
		</Fragment>
		)
}
