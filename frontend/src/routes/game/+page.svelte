<script lang="ts">
	import { onMount } from "svelte";
	import { AuthGuard } from "$lib/store/AuthGuard";
    import { goto } from "$app/navigation";
    import { removeJwt } from "$lib/jwtUtils";
	import { Button, ButtonGroup } from 'flowbite-svelte';
	import io, { Socket } from 'socket.io-client';

	const TEXT_COLOR: string = "#dcd3bc";
	const OBJ_COLOR: string = "#dcd3bc";
	const BALL_COLOR: string = "#e36c5d";

	let isLogged: boolean = false;
	let canvas: HTMLCanvasElement;
	let dataInit: boolean = false;
	
	interface Paddle {
		x: number;
		y: number;
		width: number;
		height: number;
		score: number;
		direction: number;
		speed: number;
	}
	
	interface Ball {
		x: number;
		y: number;
		size: number;
		direction: any;
		speed: any;
	}
	
	let gameStarted: boolean = false;
	
	let ctx: any;
	let mouseY: number;
	
	let gameLeftPaddle: Paddle;
	let gameRightPaddle: Paddle;
	let gameBall: Ball;
	
	let playerNumber: number = 0;
	
	let socket: Socket;

	onMount(async () => {
		AuthGuard()
		.then((res) => {
			isLogged = true;
		})
		.catch((err) => {
			removeJwt();
			goto("/login")
		})
		canvas = document.getElementById('main-game-canvas') as HTMLCanvasElement;
		canvas.width = window.innerWidth * 0.7;
		canvas.height = window.innerHeight * 0.8;
		ctx = canvas.getContext('2d');
		if (!ctx) {
			return;
		}
		ctx.font = canvas.width * 0.03 + 'px Courier';
		ctx.fillStyle = TEXT_COLOR;
	});
	
	function drawPaddles(leftPaddle: any, rightPaddle: any) {
		ctx.fillStyle = OBJ_COLOR;
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
	
	function drawBall(ball: any) {
		ctx.fillStyle = BALL_COLOR;
		const radius = ball.size / 2;
		ctx.beginPath();
		ctx.arc(ball.x + ball.size / 2, ball.y + ball.size / 2, radius, 0, 2 * Math.PI);
		ctx.fill();
		ctx.stroke();
	}
		
	function drawSep(ball: any) {
		ctx.fillStyle = OBJ_COLOR;
		for (let i = 0; i < canvas.height; i += ball.size * 2) {
			ctx.fillRect(canvas.width / 2 - ball.size / 4, i, ball.size / 4, ball.size);
		}
	}
		
	function drawScores(leftScore: number, rightScore: number) {
		ctx.fillStyle = OBJ_COLOR;
		ctx.fillText(leftScore, canvas.width * 0.4, canvas.height * 0.1);
		ctx.fillText(rightScore, canvas.width * 0.6 - ctx.measureText(rightScore).width, canvas.height * 0.1);
	}

	async function drawCounter() {
		clearCanvas();
		for (let i = 3; i > 0; i--) {
			ctx.font = 'bold ' + canvas.width * 0.1 + 'px Courier';
			ctx.fillText(i, canvas.width * 0.5 - ctx.measureText(i).width / 2, canvas.height * 0.5);
			await new Promise(r => setTimeout(r, 500));
			clearCanvas();
		}
	}

	function handleResize() {
		socket.emit('resize', {width: canvas.width, height: canvas.height});
	}
	
	function handleMouseMove(e: any) {
		mouseY = e.clientY - canvas.offsetTop;
		socket.emit('mousemove', {mouseY});	
	}
	
	function handleKeyDown(e: any) {
		const move: string = e.key;
		socket.emit('keydown', {move});
	}
	
	function handleKeyUp(e: any) {
		const move: string = e.key;
		socket.emit('keyup', {move});
	}

	function drawWinner(winner: string) {
		clearCanvas();
		ctx.fillStyle = OBJ_COLOR;
		let winMsg: string = winner + ' Paddle won!';
		ctx.font = 'bold ' + canvas.width * 0.03 + 'px Courier';
		ctx.fillText(
			winMsg,
			canvas.width / 2 - ctx.measureText(winMsg).width / 2,
			canvas.height / 2 
		)
		ctx.font = 'bold ' + canvas.width * 0.03 + 'px Courier';
		gameStarted = false;
		socket.disconnect();
	}

	function gameLoop() {
		if (gameStarted && dataInit) {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			drawPaddles(gameLeftPaddle, gameRightPaddle);
			drawSep(gameBall);	
			drawScores(gameLeftPaddle.score, gameRightPaddle.score);
			drawBall(gameBall);
		}
		requestAnimationFrame(gameLoop);
	}
	
	function startGame() {
		socket.on('initData', ({leftPaddle, rightPaddle, ball}) => {
			gameLeftPaddle = leftPaddle;
			gameRightPaddle = rightPaddle;
			gameBall = ball;
			dataInit = true;
		});
		socket.on('paddlesData',  ({ leftPaddle, rightPaddle }) => {
			gameLeftPaddle = leftPaddle;
			gameRightPaddle = rightPaddle;
		});
		socket.on('ballData',  ({ ball }) => {
			gameBall = ball;
		});
		socket.on('scoresData',  ({ leftScore, rightScore }) => {
			gameLeftPaddle.score = leftScore;
			gameRightPaddle.score = rightScore;
		});
		socket.on('rightWin',  ({}) => {
			gameRightPaddle.score++;
			drawWinner('Right');
			drawScores(gameLeftPaddle.score, gameRightPaddle.score);
			gameLeftPaddle.score = 0;	
			gameRightPaddle.score = 0;
		});
		socket.on('leftWin',  ({}) => {
			gameLeftPaddle.score++;
			drawWinner('Left');
			drawScores(gameLeftPaddle.score, gameRightPaddle.score);
			gameLeftPaddle.score = 0;	
			gameRightPaddle.score = 0;
		});
		gameLoop();
	}
	
	function isReady() {
		socket = io('http://localhost:4000');
		if (!gameStarted) {
			gameStarted = true;
			canvas.addEventListener('mousemove', handleMouseMove);	
			socket.emit('ready', {width: canvas.width, height: canvas.height});
			startGame();
		}
	}

	function clearCanvas() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
	}

	function createCanvas(nb: number) {
		if (playerNumber)
			playerNumber = nb;
		clearCanvas();
		const WelcomeMsg = 'Click to start the game!';
		ctx.fillText(
			WelcomeMsg,
			canvas.width * 0.5 - ctx.measureText(WelcomeMsg).width / 2,
			canvas.height * 0.5,
		);
		canvas.onclick = isReady;
	}

</script>

<style>
	canvas:hover {
		cursor: none;
	}

	canvas {
		background-color: "#dcd3bc";
		border-radius: 10px;
		padding-left: 0;
		padding-right: 0;
		margin-left: auto;
		margin-right: auto;
		display: block;
		outline: #dcd3bc 0.35vw solid;
		display: flex;
		margin-top: 5vh;
		margin-bottom: 5vh;
		width: 70vw;
		height: 70vh;
	}
</style>

<ButtonGroup>
	<Button outline color="dark" on:click={() => {createCanvas(1);}}>Solo</Button>
	<Button outline color="dark" on:click={() => {createCanvas(2);}}>Multiplayer</Button>
</ButtonGroup>
<canvas id="main-game-canvas" class="game-canvas">
</canvas>
<svelte:window
	on:keydown|preventDefault={handleKeyDown}
	on:keyup|preventDefault={handleKeyUp}
	on:resize={handleResize}
/>
