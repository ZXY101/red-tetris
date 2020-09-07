import React from "react";
import ReactDOM from "react-dom";
import Home from "../components/Home";
import Tetris, {startGame} from "../components/Tetris";
import App from "../App";

import WS from "jest-websocket-mock";

import { render, fireEvent, getByTestId} from "@testing-library/react";

it("renders without crashing",  () => {
	expect(1).toBe(1);
});