import { Injectable } from "@nestjs/common";

export class Paddle {
	constructor() {}
	public x: number;
	public y: number;
	public width: number;
	public height: number;
	public score: number;
	public direction: number;
	public speed: number;
}

export class Ball {
	constructor() {}
	public x: number;
	public y: number;
	public size: number;
	public direction: any;
	public speed: any;
}

export class GameCanvas {
	constructor (
	public width: number,
	public height: number,
	) {}
}
