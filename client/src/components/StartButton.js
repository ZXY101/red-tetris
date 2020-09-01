import React from 'react'

export default function StartButton({ callBack, gameStarted }) {
	return (
		<button type="button" className="nes-btn is-primary" onClick={callBack} style={{width: "200px", marginTop: "10px"}}>
			{!gameStarted ? "Start Game" : "Restart Game"}
		</button>
	)
}
