<script lang="ts">
	import { onMount } from "svelte";
	import { AuthGuard } from "$lib/store/AuthGuard";
    import { goto } from "$app/navigation";
    import { getJwt, removeJwt } from "$lib/jwtUtils";
	import io, { Socket } from 'socket.io-client';
    import { API_URL } from "$lib/env";
    import { userProfileDataStore, usersDataStore } from "$lib/store/user";

	const OBJ_COLOR: string = "#dcd3bc";
	const BALL_COLOR: string = "#e39c9a";

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
	let clickMode : boolean = false;
	let ctx: any;
	let playAlone: boolean = false;
	let botLevel: number = 0;
	let mouseY: number;
	
	let gameLeftPaddle: Paddle;
	let gameRightPaddle: Paddle;
	let gameBall: Ball;
	let gameOpponentLogin: string = '';
	let gamePlayerLogin: string = '';
	let gamePlayerSide: number = 0;
	
	let playerNumber: number = 0;
	let idSend: any = -1;
	let idReceive: any = -1;

	let socket: Socket;	
	let jwt: any;
	let animationFrame: any;
	let currMsg: any;

	let userProfile : any;
	let allUsers : any;

	usersDataStore.subscribe(val => allUsers = val);
	userProfileDataStore.subscribe(val => userProfile = val);

	function connectSocket() {
		socket = io(API_URL, {
			path: '/pong',
			query: { token: jwt}
		});

		socket.on("user_update", (data: any) => {
			console.log(data);
			
			if (data.id && userProfile.id && data.id == userProfile.id)
				userProfileDataStore.set(data);
			if (allUsers && allUsers.length != 0) {
				let arrId : number [] = [];
				for (let i = 0; i < allUsers.length; i++) {
					if (allUsers[i].id == data.id) {
						allUsers[i] = data;
						usersDataStore.set(allUsers);
						arrId.push(data.id);
					}
				}
				if (arrId && !arrId.includes(data.id)) {
					allUsers.push(data);
					usersDataStore.set(allUsers);
				}
			}
		});
	}

	onMount(async () => {
		jwt = getJwt();
		connectSocket();
		const URL = new URLSearchParams(window.location.search);
		if (URL.has('id_send') && URL.has('id_receive')) {
			idSend = URL.get('id_send');
			if (idSend) {
				idSend = parseInt(idSend);
			}
			idReceive = URL.get('id_receive');
			if (idReceive) {
				idReceive = parseInt(idReceive);
			}
		}
		await AuthGuard()
		.then((res) => {
			isLogged = true;
		})
		.catch((err) => {
			removeJwt();
			goto("/login")
		})
		if (idSend !== -1 && idReceive !== -1) {
			createCanvas(2);
		}
	});	
	
	function handleResize() {
		socket.emit('resize', {
			width: window.innerWidth,
			height: window.innerHeight,
		});
		if (!canvas) {
			return console.log('canvas undefined');
		}
		canvas.width = window.innerWidth * 0.7;
		canvas.height = window.innerHeight * 0.8;
		ctx.fillStyle = OBJ_COLOR;
		if (currMsg) {
			if (currMsg == 1 || currMsg == 2 || currMsg == 3)
				ctx.font = 'bold ' + canvas.width * 0.1 + 'px Audiowide';
			else
				ctx.font = 'bold ' + canvas.width * 0.04 + 'px Audiowide';
			clearCanvas();
			ctx.fillText(currMsg, canvas.width / 2 - ctx.measureText(currMsg).width / 2, canvas.height / 2);
		}
	}

	function handleMouseMove(e: any) {
		mouseY = e.clientY - canvas.offsetTop;
		socket.emit('mousemove', {mouseY});	
	}
	
	function removeEvents() {
		canvas.removeEventListener('mousemove', handleMouseMove);
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
		ctx.fillStyle = OBJ_COLOR;
	}
		
	function drawSep(ball: any) {
		for (let i = 0; i < canvas.height; i += ball.size * 2) {
			ctx.fillRect(canvas.width / 2 - ball.size / 4, i, ball.size / 4, ball.size);
		}
	}
		
	function drawScores(leftScore: number, rightScore: number) {
		ctx.font = 'bold ' + canvas.width * 0.04 + 'px Audiowide';
		ctx.fillText(leftScore, canvas.width * 0.4, canvas.height * 0.1);
		ctx.fillText(rightScore, canvas.width * 0.6 - ctx.measureText(rightScore).width, canvas.height * 0.1);
	}

	async function drawCounter() {
		clearCanvas();
		ctx.font = 'bold ' + canvas.width * 0.1 + 'px Audiowide';
		for (let i = 3; i > 0; i--) {
			currMsg = i;
			ctx.fillText(i, canvas.width / 2 - ctx.measureText(i).width / 2, canvas.height / 2);
			await new Promise(r => setTimeout(r, 800));
			clearCanvas();
		}
		currMsg = null;
		ctx.font = 'bold ' + canvas.width * 0.04 + 'px Audiowide';
	}

	function drawWaitingForOpponent() {
		currMsg = 'Waiting for opponent...';
		ctx.fillText(
			currMsg,
			canvas.width / 2 - ctx.measureText(currMsg).width / 2,
			canvas.height / 2 
		);
	}

	async function drawOpponent(opponentMsg: string) {
		clearCanvas();
		currMsg = opponentMsg;
		ctx.fillText(
			currMsg,
			canvas.width / 2 - ctx.measureText(currMsg).width / 2,
			canvas.height / 2 
		);
		await new Promise(r => setTimeout(r, 2000));
		currMsg = null;
	}

	async function drawWinner(winnerMsg: string) {
		currMsg = winnerMsg;
		ctx.fillText(
			currMsg,
			canvas.width / 2 - ctx.measureText(currMsg).width / 2,
			canvas.height / 2 
		);
		await new Promise(r => setTimeout(r, 1500));
		currMsg = null;
	}

	function playAgain() {
		clearCanvas();
		currMsg = 'Click to play again';
		ctx.fillText(currMsg, canvas.width / 2 - ctx.measureText(currMsg).width / 2, canvas.height / 2);
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

	async function startGame() {
		socket.on('paddlesData', ({leftPaddle, rightPaddle}) => {
			gameLeftPaddle = leftPaddle;
			gameRightPaddle = rightPaddle;
		});
		socket.on('ballData', ({ball}) => {
			gameBall = ball;
		});
		socket.on('winner', async ({winner, side, forfeit}) => {
			gameStarted = false;
			dataInit = false;
			if (side === 1) {
				gameRightPaddle.score++;
			} else if (side === -1) {
				gameLeftPaddle.score++;
			}
			clearCanvas();
			removeEvents();
			socket.disconnect();
			connectSocket();
			gameLeftPaddle.score = 0;	
			gameRightPaddle.score = 0;
			cancelAnimationFrame(animationFrame);
			let winMsg = winner + ' won the game';
			if (forfeit) {
				winMsg += ' by forfeit!';
			}
			else {
				drawScores(gameLeftPaddle.score, gameRightPaddle.score);
			}
			await drawWinner(winMsg);
			playAgain();
		});
		if (gamePlayerSide === -1) {
			await drawOpponent(`${gamePlayerLogin} VS ${gameOpponentLogin}`);
		} else {
			await drawOpponent(`${gameOpponentLogin} VS ${gamePlayerLogin}`);
		}
		await drawCounter();
		canvas.addEventListener('mousemove', handleMouseMove);
		socket.emit('gameLoop', {});
		gameLoop();
	}

	async function isReady() {
		if (!gameStarted) {
			gameStarted = true;
			socket.on('foundOpponent', ({opponentLogin, playerLogin, leftPaddle, rightPaddle, ball, playerSide}) => {
				currMsg = null;
				gameLeftPaddle = leftPaddle;
				gameRightPaddle = rightPaddle;
				gameBall = ball;
				gameOpponentLogin = opponentLogin;
				gamePlayerLogin = playerLogin;
				gamePlayerSide = playerSide
				dataInit = true;	
				startGame();
			});
			if (idSend) {
				socket.emit('ready', {
					width: canvas.width,
					height: canvas.height,
					playerNumber: playerNumber,
					botLevel: botLevel,
					leftPlayerID: idSend,
					rightPlayerID: idReceive,
				});
				
			} else {
				socket.emit('ready', {
					width: canvas.width,
					height: canvas.height,
					playerNumber: playerNumber,
					botLevel: botLevel,
					LeftPlayerID: null,
					RightPlayerID: null,
				});
			}
			if (playerNumber === 2) {
				drawWaitingForOpponent();
			}
		}
	}
  
	function clearCanvas() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
	}

	function createCanvas(userNb: number) {
		if (userNb === 1) {
			const slider = document.getElementById('custom-slider') as HTMLInputElement;
			if (slider) {
				botLevel = parseInt(slider.value) / 100;
			}
		}
		clickMode = true;
		canvas = document.createElement("canvas");
		canvas.setAttribute("id", "main-game-canvas");
		canvas.setAttribute("class", "game-canvas")
		canvas.width = window.innerWidth * 0.7;
		canvas.height = window.innerHeight * 0.8;
		ctx = canvas.getContext('2d');
		if (!ctx) return;
		ctx.font = canvas.width * 0.04 + 'px Audiowide';
		ctx.fillStyle = OBJ_COLOR;
	
		containerCanvas.appendChild(canvas)
		playerNumber = userNb;
		isReady();
	}

</script>

{#if !gameStarted && !clickMode}
	<div class="game-mode mt-20">
		<h3 class="mb-10">Choose a game mode</h3>
		<div class="space-x-5 mb-10">
			{#if !playAlone}	
			<button class="button-mode" on:click={() => playAlone = true}>
				Solo
			</button>
			<button class="button-mode" on:click={() => {createCanvas(2);}}>
				Multiplayer
			</button>
			{/if}
			<div class="play-with-bot">
				{#if playAlone}
				  <label for="bot-level" class="bot-level">Bot level</label>
				  <input type="range" name="bot-level" id="custom-slider" class="custom-slider appearance-none" min="30" max="70">
				  <button class="button-mode" id="play-alone-button" on:click={() => createCanvas(1)}>Play now</button>
				{/if}
			</div>
		</div>
	</div>
{/if}
<div bind:this={containerCanvas} />

<svelte:window
	on:resize={handleResize}
/>
