import React, { Fragment } from 'react'

export default function Display({ gameOver, text}) {
	return (
		<Fragment>
			{!gameOver ?
				(<div className="nes-container is-rounded" style={{width: "200px", marginTop: "10px"}}>
					{text}
				</div>) :
				 (
				<div className="nes-container is-rounded is-error" style={{width: "200px", marginTop: "10px", background: "red"}}>
					{text}
				</div> 
				 )
			} 
		</Fragment>
	)
}
