import React from 'react'

export default function StartButton({ callBack }) {
	return (
		<button type="button" className="nes-btn is-primary" onClick={callBack} style={{width: "200px", marginTop: "10px"}}>
			Start Game
		</button>
	)
}
