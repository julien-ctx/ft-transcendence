import { Injectable } from "@nestjs/common";

export class Ball {
	constructor(
		public x: number,
		public y: number,
		public size: number,
		public dirX: number,
		public dirY: number,
	) {}
}

export class Paddle {
	constructor(
		public x: number,
		public y: number,
		public width: number,
		public height: number,
		public score: number,
	) {}
}
