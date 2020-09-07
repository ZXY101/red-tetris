import React from "react";
import ReactDOM from "react-dom";
import App from "../App";
import Cell from "../components/Cell";
import Display from "../components/Display";
import Home from "../components/Home";
import Stage from "../components/Stage";
import StartButton from "../components/StartButton";

import WS from "jest-websocket-mock";
import { createStage } from '../helpers/gameHelpers'

import { render, fireEvent, getByTestId} from "@testing-library/react";

it("renders without crashing", () => {
	const div = document.createElement("div");
	ReactDOM.render(<App />, div);
	// ReactDOM.unmountComponentAtNode(div);
});

it("renders without crashing", () => {
	const div = document.createElement("div");
	ReactDOM.render(<Cell type="L"/>, div);
	ReactDOM.unmountComponentAtNode(div);
});

it("renders without crashing", () => {
	const div = document.createElement("div");
	ReactDOM.render(<Display gameOver={false} text="Text"/>, div);
	ReactDOM.render(<Display gameOver={true} text="Text"/>, div);
	ReactDOM.unmountComponentAtNode(div);
});

it("renders without crashing", () => {
	const ws = new WebSocket("ws://localhost:9090");
	const div = document.createElement("div");

	ReactDOM.render(<Home ws={ws} clientId="clientId" gameFull={false} playerLeft={false}/>, div);
	ReactDOM.render(<Home ws={ws} clientId="clientId" gameFull={false} playerLeft={true}/>, div);
	ReactDOM.render(<Home ws={ws} clientId="clientId" gameFull={true} playerLeft={true}/>, div);
	ReactDOM.render(<Home ws={ws} clientId="clientId" gameFull={true} playerLeft={false}/>, div);
	ReactDOM.unmountComponentAtNode(div);
});

it("sends a payload", async () => {
	const server = new WS("ws://localhost:1234");
	const client = new WebSocket("ws://localhost:1234");
	await server.connected;
	
	const { container } = render(<Home ws={client} clientId="clientId"/>);
	
	const createGameButton = getByTestId(container, "createGameButton");
	
	fireEvent.click(createGameButton);
	server.close();
	WS.clean();
});

it("renders without crashing", () => {
	const div = document.createElement("div");
	ReactDOM.render(<Stage stage={createStage()} player={"1"}/>, div);
	ReactDOM.unmountComponentAtNode(div);
});

it("renders without crashing", () => {
	const div = document.createElement("div");
	ReactDOM.render(<StartButton gameStarted={false}/>, div);
	ReactDOM.render(<StartButton gameStarted={true}/>, div);
	ReactDOM.unmountComponentAtNode(div);
});
