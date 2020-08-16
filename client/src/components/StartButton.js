import React from 'react'
import {StyledStartButton} from './styles/StyledStartButton'

export default function StartButton({ callBack }) {
	return (
		<div>
			<StyledStartButton onClick={callBack}>
				Start Game
			</StyledStartButton>
		</div>
	)
}
