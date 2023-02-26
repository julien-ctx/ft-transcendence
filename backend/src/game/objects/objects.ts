import { Injectable } from "@nestjs/common";

export class Ball {
	constructor(
		private x: number,
		private y: number,
		private size: number,
	) {}
}

export class Paddle {
	constructor(
		private x: number,
		private y: number,
		private width: number,
		private height: number
	) {}


	setData(data: Object) {

	}
}
