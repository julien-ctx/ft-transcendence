<script lang="ts">
	import { onMount } from "svelte";
	import { AuthGuard } from "../../lib/AuthGuard";
    import { goto } from "$app/navigation";
    import { removeJwt } from "$lib/jwtUtils";
	import { Button } from 'flowbite-svelte';
	import io, { Socket } from 'socket.io-client';
	
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
	
	/* Game data */
	let gameStarted: boolean = false;
	let maxScore: number;

	let canvas: HTMLCanvasElement;
	let ctx: any;
	let mouseY: number;

	let rightPaddle: any;
	let leftPaddle: any;
	let ball: any;

	let paddleDirection: number = 0;
	let ballDirection: any;

	let ballSpeed: any;
	let paddleSpeed: number;
	let singlePlayer: boolean = true;

	const socket = io('http://localhost:4000');

	function randomBallDirection(): number {
		return Math.round(Math.random()) * 2 - 1;
	}

	/* Drawing functions */
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
		
	function drawBall(color: string) {
		ctx.fillStyle = color;
		const radius = ball.size / 2;
		ctx.beginPath();
		ctx.arc(ball.x + ball.size / 2, ball.y + ball.size / 2, radius, 0, 2 * Math.PI);
		ctx.fill();
		ctx.stroke();
	}
		
	function drawSep(color: string) {
		for (let i = 0; i < canvas.height; i += ball.size * 2) {
			ctx.fillStyle = color;
			ctx.fillRect(canvas.width / 2 - ball.size / 4, i, ball.size / 2, ball.size);
		}
	}
		
	function drawScore() {
			ctx.fillText(leftPaddle.score, canvas.width * 0.4, canvas.height * 0.1);
			ctx.fillText(rightPaddle.score, canvas.width * 0.6 - ctx.measureText(rightPaddle.score).width, canvas.height * 0.1);
	}
	
	function resetBall(side: number) {
		ball.x = canvas.width * 0.5;
		ball.y = canvas.height * 0.5;
		if ((side < 0 && ballDirection.x > 0) ||
			(side > 0 && ballDirection.x < 0))
			ball.dirX = -ballDirection.x;
		ball.dirY = randomBallDirection() < 0 ? ballDirection.y : -ballDirection.y;
	}
	
	function checkBallPosition() {
		if (ball.x < 0) {
			resetBall(-1);
			if (++rightPaddle.score === maxScore) {
				ctx.font = 'bold ' + canvas.width * 0.03 + 'px Courier';
				ctx.clearRect(0, 0, canvas.width, canvas.height);
				let winMsg: string = 'Right Paddle won!';
				ctx.fillText(
					winMsg,
					canvas.width / 2 - ctx.measureText(winMsg).width / 2,
					canvas.height / 2
				)
				gameStarted = false;
			}
		}
		else if (ball.x > canvas.width - ball.size) {
			resetBall(1);
			if (++leftPaddle.score === maxScore) {
				ctx.clearRect(0, 0, canvas.width, canvas.height);
				let winMsg: string = 'Left Paddle won!';
				ctx.font = 'bold ' + canvas.width * 0.03 + 'px Courier';
				ctx.fillText(
					winMsg,
					canvas.width / 2 - ctx.measureText(winMsg).width / 2,
					canvas.height / 2 
				)
				gameStarted = false;
			}
		}
		ctx.font = 'bold ' + canvas.width * 0.03 + 'px Courier';
		drawScore();
	}
	
	function movePaddles() {
		if (paddleDirection == -1) {
			if (leftPaddle.y - paddleSpeed >= 0) {
				leftPaddle.y -= paddleSpeed;
			} else {
				leftPaddle.y = 0;
			}
		}
		else if (paddleDirection == 1) {
			if (leftPaddle.y + paddleSpeed <= canvas.height - leftPaddle.height) {
				leftPaddle.y += paddleSpeed;
			} else {
				leftPaddle.y = canvas.height - leftPaddle.height;
			}
		}
	}
	
	function collision(paddle: any) {
		const deltaX = ball.x - Math.max(paddle.x, Math.min(ball.x, paddle.x + paddle.width));
		const deltaY = ball.y - Math.max(paddle.y, Math.min(ball.y, paddle.y + paddle.height));
		return (deltaX * deltaX + deltaY * deltaY) < (ball.size * ball.size);
	}

	function updateBot() {
		if (ball.y < rightPaddle.y + rightPaddle.height / 2) {
			if (rightPaddle.y - (paddleSpeed / 2) < 0)
				rightPaddle.y = 0;
			else
				rightPaddle.y -= (paddleSpeed / 1.25);
		}
		else if (ball.y > rightPaddle.y + rightPaddle.height / 2) {
			if (rightPaddle.y + rightPaddle.height + (paddleSpeed / 2) > canvas.height)
				rightPaddle.y = canvas.height - rightPaddle.height;
			else
				rightPaddle.y += (paddleSpeed / 1.25);
		}
	}

	async function gameLoop() {
		if (!ctx) return;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		drawPaddles('blue');
		ball.x += ball.dirX * ballSpeed.x;
		ball.y += ball.dirY * ballSpeed.y;
		if (ball.y < 0) {
			ball.y = 0;
			ball.dirY = -ball.dirY;
		}
		else if (ball.y > canvas.height - ball.size) {
			ball.y = canvas.height - ball.size;
			ball.dirY = -ball.dirY;
		}
		
		if (ball.x <= leftPaddle.x + leftPaddle.width && collision(leftPaddle)) {
			ball.dirX = -ball.dirX;
			ball.x = leftPaddle.x + leftPaddle.width;
		}
		else if (ball.x + ball.size >= rightPaddle.x && collision(rightPaddle)) {
			ball.dirX = -ball.dirX;
			ball.x = rightPaddle.x - ball.size;
		}
		
		checkBallPosition();
		if (gameStarted) {
			drawSep('blue');
			drawBall('red');
			movePaddles();
			if (singlePlayer)
			updateBot();	
			requestAnimationFrame(gameLoop);
		}
	}

	async function startGame() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		for (let i = 3; i > 0; i--) {
			ctx.font = 'bold ' + canvas.width * 0.1 + 'px Courier';
			ctx.fillText(i, canvas.width * 0.5 - ctx.measureText(i).width / 2, canvas.height * 0.5);
			await new Promise(r => setTimeout(r, 500));
			ctx.clearRect(0, 0, canvas.width, canvas.height);	
		}
		gameLoop();
	}

	function initData() {
		ballDirection = {
			x: 2 * randomBallDirection(),
			y: 2 * randomBallDirection(),
		}
		paddleDirection = 0;

		rightPaddle = {
			x: canvas.width - canvas.width * 0.015 - canvas.width * 0.005,
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
			size: canvas.width * 0.02,
			dirX: ballDirection.x,
			dirY: ballDirection.y,
		};
		
		paddleSpeed = canvas.height * 0.015;
		ballSpeed = {
			x: canvas.width * 0.004,
			y: canvas.height * 0.007,
		};

		maxScore = 2;
	}

	function addEvents() {
		window.addEventListener('resize', function(e) {
			const width = canvas.width;
			const height = canvas.height;
			canvas.width = window.innerWidth * 0.7;
			canvas.height = window.innerHeight * 0.8;
			rightPaddle.x = canvas.width - canvas.width * 0.015 - canvas.width * 0.005;
			rightPaddle.width =  canvas.width * 0.005;
			rightPaddle.height = canvas.height * 0.15;
			rightPaddle.y = rightPaddle.y * canvas.height / height;
			leftPaddle.x = canvas.width * 0.015;
			leftPaddle.width = canvas.width * 0.005;
			leftPaddle.height = canvas.height * 0.15;
			leftPaddle.y = leftPaddle.y * canvas.height / height;
			ball.size = canvas.width * 0.02;
			ball.x = ball.x * canvas.width / width;
			ball.y = ball.y * canvas.height / height;
			paddleSpeed = canvas.height * 0.015;
			ballSpeed = {
				x: canvas.width * 0.004,
				y: canvas.height * 0.007,
			};
		}, true);

		canvas.addEventListener('mousemove', (event) => {
			mouseY = event.clientY - canvas.offsetTop;
			if (mouseY < 0) {
				mouseY = 0;
			} else if (mouseY > canvas.height - (leftPaddle.height)) {
				mouseY = canvas.height - (leftPaddle.height);
			}
			leftPaddle.y = mouseY;
		});	

		document.addEventListener('keydown', function(e) {
			if (e.key == 'ArrowUp') {
				paddleDirection = -1;
			}
			else if (e.key == 'ArrowDown') {
				paddleDirection = 1;
			}
			e.preventDefault();
			return false;
		});

		document.addEventListener('keyup', function(e) {
			if (e.key == 'ArrowUp' || e.key == 'ArrowDown') {
				paddleDirection = 0;
			}
			e.preventDefault();
			return false;
		});
	}
	
	onMount(() => {
		canvas = document.getElementById('main-game-canvas') as HTMLCanvasElement;
		canvas.width = window.innerWidth * 0.7;
		canvas.height = window.innerHeight * 0.8;
		console.log(canvas.width, canvas.height);
		ctx = canvas.getContext('2d');
		ctx.font = 'bold ' + canvas.width * 0.03 + 'px Courier';
		ctx.fillStyle = 'blue';
		const WelcomeMsg = 'Click to start the game!';
		ctx.fillText(
			WelcomeMsg,
			canvas.width * 0.5 - ctx.measureText(WelcomeMsg).width / 2,
			canvas.height * 0.5,
		);
		canvas.onclick = isReady;
	});
	
	function isReady() {
		if (!gameStarted) {
			initData();
			gameStarted = true;
			addEvents();
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
		outline: lightgrey 0.5vw solid;
		display: flex;
		margin-top: 5vh;
		margin-bottom: 5vh;
		width: 70vw;
		height: 70vh;
	}
</style>
<canvas id="main-game-canvas" class="game-canvas">
</canvas>
