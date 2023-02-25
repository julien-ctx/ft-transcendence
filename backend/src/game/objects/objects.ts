import { Injectable } from "@nestjs/common";

export class Ball {

}

export class Paddle {
	constructor(private x: number = 0, private y: number = 0) {}
}
