import React from 'react'
import { StyledDisplay } from './styles/StyleDisplay'

export default function Display({ gameOver, text}) {
	return (
		<StyledDisplay gameOver={gameOver}>
			{text}
		</StyledDisplay>
	)
}
