<script lang="ts">
	import { onMount } from "svelte";
	import { AuthGuard } from "../../lib/AuthGuard";
    import { goto } from "$app/navigation";
    import { removeJwt } from "$lib/jwtUtils";
	import { Button } from 'flowbite-svelte';
	import io, { Socket } from 'socket.io-client';
    import { right } from "@popperjs/core";
	
	let isLogged = false;
	onMount(async () => {
		AuthGuard()
		.then((res) => {
			isLogged = true;
		})
		.catch((err) => {
			removeJwt();
			goto("/login")
		})
	});
	
	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;
	let rightPaddle: any;
	let leftPaddle: any;
	let ball: any;
	let speed_x: number = 20;
	let speed_y: number = -20;
	
	function drawPaddles(
		color: string
	) {
		ctx.fillStyle = color;
		ctx.fillRect(
			leftPaddle.x - (leftPaddle.width / 2),
			leftPaddle.y - (leftPaddle.height / 2),
			leftPaddle.width, leftPaddle.height
		);
		ctx.fillRect(
			rightPaddle.x - (rightPaddle.width / 2),
			rightPaddle.y - (rightPaddle.height / 2),
			rightPaddle.width, rightPaddle.height
		);
	}

	function drawSep(color: string) {
		for (let i = 0; i < canvas.width; i += ball.size * 2) {
			ctx.fillStyle = color;
			ctx.fillRect(canvas.width / 2 - ball.size / 4, i, ball.size / 2, ball.size);
		}
	}

	function gameLoop() {
		if (!ctx) return;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		drawPaddles('blue');
		ball.x += speed_x;
		ball.y += speed_y;
		
		if (ball.x < ball.size) {
			ball.x = ball.size;
			speed_x *= -1;
		}
		else if (ball.x > canvas.width - ball.size) {
			ball.x = canvas.width - ball.size;
			speed_x *= -1;	
		}
				
		if (ball.y < ball.size) {
			ball.y = ball.size;
			speed_y *= -1;
		}
		else if (ball.y > canvas.height - ball.size) {
			ball.y = canvas.height - ball.size;
			speed_y *= -1;	
			console.log(speed_y)
		}
				
		drawBall('blue');
		drawSep('blue');
		requestAnimationFrame(gameLoop);
	}

	function startGame() {
		gameLoop()
	}

	function drawBall(color: string) {
		const radius = canvas.width * 0.01;
		ctx.beginPath();
		ctx.arc(ball.x, ball.y, radius, 0, 2 * Math.PI, false);
		ctx.fillStyle = color;
		ctx.fill();
		ctx.stroke();
	}

	function initData() {
		canvas = document.getElementById('main-game-canvas') as HTMLCanvasElement;
		canvas.width = window.innerWidth - 10;
		canvas.height = window.innerHeight * 0.90 - 10;
		ctx = canvas.getContext('2d');
		rightPaddle = {
			x: canvas.width - canvas.width * 0.015,
			y: canvas.height - canvas.height * 0.5,
			width: canvas.width * 0.005,
			height: canvas.height * 0.15,
		};

		leftPaddle = {
			x: canvas.width * 0.015,
			y: canvas.height * 0.5,
			width: canvas.width * 0.005,
			height: canvas.height * 0.15,
		};

		ball = {
			x: canvas.width * 0.5,
			y: canvas.height * 0.5,
			size: canvas.width * 0.01,
		};
	}

	onMount(() => {
		initData();
		startGame()
	});
</script>

<style>
	canvas:hover {
  		cursor: none;
	}

	canvas {
		background-color: black;
	}
</style>

<canvas id="main-game-canvas" class="game-canvas">
</canvas>
