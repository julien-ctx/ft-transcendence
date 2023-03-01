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
	
	let mouse: boolean = false;
	let keyboard: boolean = false;
	let maxScore: number = 2;

	let canvas: HTMLCanvasElement;
	let ctx: any;

	let rightPaddle: any;
	let leftPaddle: any;
	let paddleDirection: number = 0;

	let ball: any;
	let speedX: number = -7.5;
	let speedY: number = -7;

	function drawPaddles(color: string) {
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

	function keyboardMoves(canvas: HTMLCanvasElement) {
		document.addEventListener('keydown', function(e) {
			if (e.key == 'ArrowUp') {
				paddleDirection = -1;
			}
			else if (e.key == 'ArrowDown') {
				paddleDirection = 1;
			}
		});

		document.addEventListener('keyup', function(e) {
			if (e.key == 'ArrowUp' || e.key == 'ArrowDown') {
				paddleDirection = 0;
			}
		});

		if (paddleDirection == -1) {
			if (leftPaddle.y - 10 >= 0) {
				leftPaddle.y -= 10;
			} else {
				leftPaddle.y = 0;
			}
		}
		else if (paddleDirection == 1) {
			if (leftPaddle.y + 10 <= canvas.height - leftPaddle.height) {
				leftPaddle.y += 10;
			} else {
				leftPaddle.y = canvas.height - leftPaddle.height;
			}
		}
	}

	function mouseMoves(canvas: HTMLCanvasElement) {
		canvas.addEventListener('mousemove', (event) => {
			let mouseY = event.clientY - canvas.offsetTop;
			if (mouseY < 0) {
				mouseY = 0;
			} else if (mouseY > canvas.height - (leftPaddle.height)) {
				mouseY = canvas.height - (leftPaddle.height);
			}
			leftPaddle.y = mouseY;
			drawPaddles('blue');
		});

		canvas.addEventListener('mouseleave', (event) => {
			console.log(leftPaddle.y);
			if (leftPaddle.y < canvas.height / 2) {
				leftPaddle.y = 0;
			}
			else if (leftPaddle.y >= canvas.height / 2) {
				leftPaddle.y = canvas.height - leftPaddle.height;
			}
		})
	}

	function displayScore() {
  		ctx.fillText(leftPaddle.score, canvas.width * 0.4, canvas.height * 0.1);
  		ctx.fillText(rightPaddle.score, canvas.width * 0.6 - ctx.measureText(rightPaddle.score).width, canvas.height * 0.1);
	}

	function checkBallPosition() {
		if (ball.x < 0) {
			ball = {
				x: canvas.width * 0.5,
				y: canvas.height * 0.5,
				size: canvas.width * 0.01,
			};
			speedX = -7.5;
			speedY = -7;
			if (++rightPaddle.score === maxScore) {
				ctx.font = 'bold ' + canvas.width * 0.03 + 'px Courier';
				ctx.fillText(
					'Right Paddle won!',
					canvas.width / 2 - ctx.measureText('Right Paddle won!').width / 2,
					canvas.height / 2
				)
				if (mouse)
					mouse = false;
				else
					keyboard = false;
			}
		}
		else if (ball.x > canvas.width - ball.size) {
			ball = {
				x: canvas.width * 0.5,
				y: canvas.height * 0.5,
				size: canvas.width * 0.01,
			};
			speedX = 7.5;
			speedY = -7;
			if (++leftPaddle.score === maxScore) {
				ctx.font = 'bold ' + canvas.width * 0.03 + 'px Courier';
				ctx.fillText(
					'Left Paddle won!',
					canvas.width / 2 - ctx.measureText('Left Paddle won!').width / 2,
					canvas.height / 2 
				)
				if (mouse)
					mouse = false;
				else
					keyboard = false;
			}
		}
		ctx.font = 'bold ' + canvas.width * 0.03 + 'px Courier';
		displayScore();
	}
		
	function gameLoop() {
		if (!ctx) return;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		drawPaddles('blue');
		ball.x += speedX;
		ball.y += speedY;
		
		if (ball.y < 0) {
			ball.y = 0;
			speedY = -speedY;
		}
		else if (ball.y > canvas.height - ball.size) {
			ball.y = canvas.height - ball.size;
			speedY = -speedY;
		}
		
		if (collision(leftPaddle)) {
			speedX = -speedX;
			ball.x = leftPaddle.x + leftPaddle.width;
		}
		else if (collision(rightPaddle)) {
			speedX = -speedX;
			ball.x = rightPaddle.x - ball.size;
		}
		
		checkBallPosition();
		if (mouse || keyboard) {
			drawSep('blue');
			drawBall('red');
			if (mouse) {
				mouseMoves(canvas);
			} else if (keyboard) {
				keyboardMoves(canvas);
			}
			requestAnimationFrame(gameLoop);
		}
	}

	function startGame() {
		gameLoop()
	}

	function drawBall(color: string) {
		// const radius = ball.size;
		// ctx.beginPath();
		ctx.fillStyle = color;
		// ctx.arc(ball.x, ball.y, radius, 0, 2 * Math.PI, false);
		// ctx.fill();
		// ctx.stroke();
		ctx.fillRect(ball.x, ball.y, ball.size, ball.size);
	}

	function initData() {
		canvas = document.getElementById('main-game-canvas') as HTMLCanvasElement;
		canvas.width = window.innerWidth * 0.7;
		canvas.height = window.innerHeight * 0.8;
		ctx = canvas.getContext('2d');
		ctx.font = 'bold ' + canvas.width * 0.03 + 'px Courier';
		rightPaddle = {
			x: canvas.width - canvas.width * 0.015,
			y: canvas.height * 0.5 - (canvas.height * 0.15 / 2),
			width: canvas.width * 0.005,
			height: canvas.height * 0.15,
			score: 0,
		};

		leftPaddle = {
			x: canvas.width * 0.015,
			y: canvas.height * 0.5 - (canvas.height * 0.15 / 2),
			width: canvas.width * 0.005,
			height: canvas.height * 0.15,
			score: 0,
		};

		ball = {
			x: canvas.width * 0.5,
			y: canvas.height * 0.5,
			size: canvas.width * 0.01,
		};
	}

	onMount(() => {
		initData();
	});

	function enableMouse() {
		if (!keyboard && !mouse) {
			mouse = true;
			startGame();
		}
	}

	function enableKeyboard() {
		if (!keyboard && !mouse) {
			keyboard = true;
			startGame();
		}
	}

</script>

<style>
	canvas:hover {
  		cursor: none;
	}

	canvas {
		background-color: black;
		padding-left: 0;
		padding-right: 0;
		margin-left: auto;
		margin-right: auto;
		display: block;
	}
</style>
<Button on:click={enableMouse}>Mouse</Button>
<Button on:click={enableKeyboard}>Keyboard</Button>
<canvas id="main-game-canvas" class="game-canvas">
</canvas>
