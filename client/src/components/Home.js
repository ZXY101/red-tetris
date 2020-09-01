import React from 'react'

export default function Home({ws, clientId, createGame, gameFull, playerLeft}) {
	return (
		<div className="nes-container is-rounded is-centered" style={{margin: "10px"}}>
			{playerLeft ? <p>Opponent has left the game.</p> : gameFull ? <p>The Game was full.</p>:
			<p>Welcome to Red Tetris.</p>
			}
			{!playerLeft && !gameFull ?
			<div><button type="button" className="nes-btn is-primary" onClick={() => createGame(ws, clientId)}>Create Game</button></div> : null
			}
		</div>
	)
}
