<script lang="ts">
	import { onMount } from "svelte";
	import { AuthGuard } from "$lib/store/AuthGuard";
    import { goto } from "$app/navigation";
    import { getJwt, removeJwt } from "$lib/jwtUtils";
	import io, { Socket } from 'socket.io-client';
    import { API_URL } from "$lib/env";

	const OBJ_COLOR: string = "#dcd3bc";
	const BALL_COLOR: string = "#e36c5d";

	let isLogged: boolean = false;
	let canvas: HTMLCanvasElement;
	let dataInit: boolean = false;
	let containerCanvas : any;

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
	let waitingUser : boolean = false;
	let clickMode : boolean = false;
	let ctx: any;
	let mouseY: number;
	
	let gameLeftPaddle: Paddle;
	let gameRightPaddle: Paddle;
	let gameBall: Ball;
	
	let playerNumber: number = 0;

	let socket: Socket;	
	let jwt: any;
	let animationFrame: any;
	let sizeChanged = false;

	onMount(async () => {
		AuthGuard()
		.then((res) => {
			isLogged = true;
		})
		.catch((err) => {
			removeJwt();
			goto("/login")
		})
		jwt = getJwt();
		socket = io(API_URL, {
				path: '/pong',
				query: { token: jwt}
			});
		});
	
	function handleResize() {
		socket.emit('resize', {
			width: window.innerWidth,
			height: window.innerHeight,
		});
		canvas.width = window.innerWidth * 0.7;
		canvas.height = window.innerHeight * 0.8;
		ctx.fillStyle = OBJ_COLOR;
		sizeChanged = true;
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

	function removeEvents() {
		canvas.removeEventListener('mousemove', handleMouseMove);
		window.removeEventListener("keydown", handleKeyDown);
		window.removeEventListener("keyup", handleKeyUp);
	}
	
	function drawPaddles(leftPaddle: any, rightPaddle: any) {
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
		ctx.fillStyle = OBJ_COLOR;
	}
		
	function drawSep(ball: any) {
		for (let i = 0; i < canvas.height; i += ball.size * 2) {
			ctx.fillRect(canvas.width / 2 - ball.size / 4, i, ball.size / 4, ball.size);
		}
	}
		
	function drawScores(leftScore: number, rightScore: number) {
		ctx.font = 'bold ' + canvas.width * 0.03 + 'px Audiowide';
		ctx.fillText(leftScore, canvas.width * 0.4, canvas.height * 0.1);
		ctx.fillText(rightScore, canvas.width * 0.6 - ctx.measureText(rightScore).width, canvas.height * 0.1);
	}

	async function drawCounter() {
		clearCanvas();
		for (let i = 3; i > 0; i--) {
			await drawWithInterval(i, 800, 0.1);
			clearCanvas();
		}
	}

	function playAgain() {
		clearCanvas();
		const msg = 'Click to play again';
		ctx.fillText(msg, canvas.width * 0.5 - ctx.measureText(msg).width / 2, canvas.height * 0.5);
		
		canvas.onclick = () => {
			if (!gameStarted && !dataInit) {	
				clearCanvas();
				isReady();
			}
		};
	}

	function gameLoop() {
		if (gameStarted && dataInit) {
			clearCanvas();
			drawPaddles(gameLeftPaddle, gameRightPaddle);
			drawSep(gameBall);	
			drawScores(gameLeftPaddle.score, gameRightPaddle.score);
			drawBall(gameBall);
		}
		animationFrame = requestAnimationFrame(gameLoop);
	}

	function drawWithInterval(msg: any, timeout: number, fontSizeCoef: number) {
		return new Promise(resolve => {
			ctx.font = 'bold ' + canvas.width * fontSizeCoef + 'px Audiowide';
			ctx.fillText(
				msg,
				canvas.width / 2 - ctx.measureText(msg).width / 2,
				canvas.height / 2 
			)
			const intervalID = setInterval(() => {
				if (sizeChanged) {
					sizeChanged = false;
					ctx.font = 'bold ' + canvas.width * fontSizeCoef + 'px Audiowide';
					ctx.fillText(
						msg,
						canvas.width / 2 - ctx.measureText(msg).width / 2,
						canvas.height / 2 
					)
				}
			}, 1);
			setTimeout(() => {
				clearInterval(intervalID);
				resolve({});
			}, timeout);
		});
	}

	async function startGame(login: string) {
		socket.on('paddlesData',  ({leftPaddle, rightPaddle}) => {
			gameLeftPaddle = leftPaddle;
			gameRightPaddle = rightPaddle;
		});
		socket.on('ballData',  ({ball}) => {
			gameBall = ball;
		});
		socket.on('scoresData',  ({leftScore, rightScore}) => {
			gameLeftPaddle.score = leftScore;
			gameRightPaddle.score = rightScore;
		});
		socket.on('winner', async ({winner, side}) => {
			gameStarted = false;
			dataInit = false;
			if (side === 1) {
				gameRightPaddle.score++;
			} else {
				gameLeftPaddle.score++;
			}
			clearCanvas();
			removeEvents();
			socket.disconnect();
			socket = io(API_URL, {
				path: '/pong',
				query: { token: jwt}
			});
			drawScores(gameLeftPaddle.score, gameRightPaddle.score);
			gameLeftPaddle.score = 0;	
			gameRightPaddle.score = 0;
			cancelAnimationFrame(animationFrame);
			await drawWithInterval(winner + ' won the game!', 1500, 0.03);	
			playAgain();
		});

		await drawWithInterval('Your opponent is ' + login, 1500, 0.03);
		await drawCounter();
		canvas.addEventListener('mousemove', handleMouseMove);
		socket.emit('gameLoop', {});
		gameLoop();
	}

	async function isReady() {
		if (!gameStarted) {
			gameStarted = true;
			socket.on('foundOpponent', ({login, leftPaddle, rightPaddle, ball}) => {
				gameLeftPaddle = leftPaddle;
				gameRightPaddle = rightPaddle;
				gameBall = ball;
				dataInit = true;
				startGame(login);
			});
			socket.emit('ready', { width: canvas.width, height: canvas.height, playerNumber });
		}
	}
  
	function clearCanvas() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
	}

	function createCanvas(nb: number) {
		clickMode = true;
		canvas = document.createElement("canvas");
		canvas.setAttribute("id", "main-game-canvas");
		canvas.setAttribute("class", "game-canvas")
		canvas.width = window.innerWidth * 0.7;
		canvas.height = window.innerHeight * 0.8;
		ctx = canvas.getContext('2d');
		if (!ctx) return;
		ctx.font = canvas.width * 0.03 + 'px Audiowide';
		ctx.fillStyle = OBJ_COLOR;
	
		containerCanvas.appendChild(canvas)
		
		playerNumber = nb;
		isReady();
	}

</script>

{#if !gameStarted && !clickMode}
	<div class="game-mode mt-20">
		<h3 class="mb-10">Choose a game mode</h3>
		<div class="space-x-5 mb-10">
			<button class="button-mode" on:click={() => {createCanvas(1);}}>
				Solo
			</button>
			<button class="button-mode" on:click={() => waitingUser = true}>
				Multiplayer
			</button>
		</div>
		{#if waitingUser}
			<div class="mb-5">
				Waiting for opponent...
			</div>
		{/if}
	</div>
{/if}
<div bind:this={containerCanvas} />

<svelte:window
	on:keydown|preventDefault={handleKeyDown}
	on:keyup|preventDefault={handleKeyUp}
	on:resize={handleResize}
/>
