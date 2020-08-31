import React from 'react';
import Tetris from './components/Tetris';
import "nes.css/css/nes.min.css";

export default function App() {
	const ws = new WebSocket("ws://localhost:9090");

	return (
		<div className="App">
			<Tetris ws={ws}/>
		</div>
	)
}