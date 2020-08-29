import React from 'react'

export default function Home({ws, clientId, createGame}) {
	return (
		<div className="nes-container is-rounded is-centered" style={{margin: "10px"}}>
			<p>Welcome to Red Tetris.</p>
			<div><button type="button" className="nes-btn is-primary" onClick={() => createGame(ws, clientId)}>Create Game</button></div>
		</div>
	)
}
