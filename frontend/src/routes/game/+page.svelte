<script lang="ts">
	import { onMount } from "svelte";
	import { AuthGuard } from "../../lib/AuthGuard";
    import { goto } from "$app/navigation";
    import { removeJwt } from "$lib/jwtUtils";
	import { Button } from 'flowbite-svelte';
	import io, { Socket } from 'socket.io-client';
    import { right } from "@popperjs/core";
    import { redirect } from "@sveltejs/kit";
	
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
	
	let mouse: boolean = false;
	let keyboard: boolean = false;

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;

	let rightPaddle: any;
	let leftPaddle: any;

	let ball: any;
	let speed_x: number = -7.5;
	let speed_y: number = -7;
	
	function drawPaddles(
		color: string
	) {
		ctx.fillStyle = color;
		ctx.fillRect(
			leftPaddle.x,
			leftPaddle.y,
			leftPaddle.width, leftPaddle.height
		);
		ctx.fillRect(
			rightPaddle.x,
			rightPaddle.y,
			rightPaddle.width, rightPaddle.height
		);
	}

	function drawSep(color: string) {
		for (let i = 0; i < canvas.width; i += ball.size * 2) {
			ctx.fillStyle = color;
			ctx.fillRect(canvas.width / 2 - ball.size / 4, i, ball.size / 2, ball.size);
		}
	}

	function collision(paddle: any) {
		return ball.x < paddle.x + paddle.width &&
			ball.x + ball.size > paddle.x &&
			ball.y < paddle.y + paddle.height &&
			ball.y + ball.size > paddle.y;
	}

	function gameLoop() {
		if (!ctx) return;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		drawPaddles('blue');
		ball.x += speed_x;
		ball.y += speed_y;
		
		if (ball.y < 0) {
			ball.y = ball.size;
			speed_y = -speed_y;
		}
		else if (ball.y > canvas.height - ball.size) {
			ball.y = canvas.height - ball.size;
			speed_y = -speed_y;
		}
		
		if (collision(leftPaddle)) {
			speed_x = -speed_x;
			ball.x = leftPaddle.x + leftPaddle.width;
		}
		else if (collision(rightPaddle)) {
			speed_x = -speed_x;
			ball.x = rightPaddle.x - ball.size;
		}

		drawSep('blue');
		drawBall('red');

		canvas.addEventListener('mousemove', (event) => {
			let mouseY = event.clientY - canvas.offsetTop;
			if (mouseY <= 0)
				mouseY = 0;
			else if (mouseY >= canvas.height - (leftPaddle.height))
				mouseY = canvas.height - (leftPaddle.height);
			leftPaddle.y = mouseY;
			drawPaddles('blue');
		});

		requestAnimationFrame(gameLoop);
	}

	function startGame() {
		gameLoop()
	}

	function drawBall(color: string) {
		// const radius = ball.size;
		// ctx.beginPath();
		ctx.fillStyle = color;
		// ctx.arc(ball.x + leftPaddle.width, ball.y, radius, 0, 2 * Math.PI, false);
		// ctx.fill();
		// ctx.stroke();
		ctx.fillRect(ball.x, ball.y, ball.size, ball.size);
	}

	function initData() {
		canvas = document.getElementById('main-game-canvas') as HTMLCanvasElement;
		canvas.width = window.innerWidth - 10;
		canvas.height = window.innerHeight * 0.90 - 10;
		ctx = canvas.getContext('2d');
		rightPaddle = {
			x: canvas.width - canvas.width * 0.015,
			y: canvas.height * 0.5 - (canvas.height * 0.15 / 2),
			width: canvas.width * 0.005,
			height: canvas.height * 0.15,
		};

		leftPaddle = {
			x: canvas.width * 0.015,
			y: canvas.height * 0.5 - (canvas.height * 0.15 / 2),
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

	function enableMouse() {
		mouse = true;
	}

	function enableKeyboard() {
		keyboard = true;
	}

</script>

<style>
	canvas:hover {
  		cursor: none;
	}

	canvas {
		background-color: black;
	}
</style>
<Button on:click={enableMouse}>Mouse</Button>
<Button on:click={enableKeyboard}>Keyboard</Button>
<canvas id="main-game-canvas" class="game-canvas">
</canvas>
