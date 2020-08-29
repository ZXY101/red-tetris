import React, {Fragment} from 'react'
import Cell from './Cell'
import {StyledStage} from './styles/StyledStage'

export default function Stage({ stage, player }) {
	return (
		<Fragment>
			<p className="title">P{player}</p>
			<StyledStage width={stage[0].length} height={stage.length}>
				{stage.map(row => row.map((cell, x) => 
					<Cell key={x} type={cell[0]}/>
				))}
			</StyledStage>
		</Fragment>
	)
}
