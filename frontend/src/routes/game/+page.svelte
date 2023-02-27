<script lang="ts">
	import { onMount } from "svelte";
	import { AuthGuard } from "../../lib/AuthGuard";
    import { goto } from "$app/navigation";
    import { removeJwt } from "$lib/jwtUtils";
	import { Button } from 'flowbite-svelte';
	import io from 'socket.io-client';
	
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

	function initData(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
		const rightPaddle = {
			x: canvas.width - canvas.width * 0.015,
			y: canvas.height - canvas.height * 0.5,
			width: canvas.width * 0.005,
			height: canvas.height * 0.15,
		};
		const leftPaddle = {
			x: canvas.width * 0.015,
			y: canvas.height * 0.5,
			width: canvas.width * 0.005,
			height: canvas.height * 0.15,
		};
		const ball = {
			x: canvas.width * 0.5,
			y: canvas.height * 0.5,
			size: canvas.width * 0.01,
		};
		const socket = io('http://localhost:4000');
		socket.emit('setObjects', { rightPaddle, leftPaddle, ball});
		return socket;
	}

	function drawPaddles(
		rightPaddle: any,
		leftPaddle: any,
		ctx: CanvasRenderingContext2D,
		canvas: HTMLCanvasElement,
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

	function moveBall(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {

	}
	
	function resetCanvas(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
		ctx.fillStyle = 'black';
		ctx.fillRect(0, 0, canvas.width, canvas.height);
	}

	function drawBall(ball: any, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, color: string) {
		const radius = canvas.width * 0.01;
		ctx.beginPath();
		ctx.arc(ball.x, ball.y, radius, 0, 2 * Math.PI, false);
		ctx.fillStyle = color;
		ctx.fill();
		ctx.stroke();
	}
	
	function launchBall(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
		drawBall({x: canvas.width / 2, y: canvas.height / 2 }, canvas, ctx, 'blue');
	}
	
	function startGame(objects: any, ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, socket: any) {
		drawPaddles(objects.rightPaddle, objects.leftPaddle, ctx, canvas, 'blue');
		launchBall(ctx, canvas);

		canvas.addEventListener('mousemove', (event) => {
			let mouseY = event.clientY - canvas.offsetTop;
			if (mouseY <= objects.leftPaddle.height / 2)
				mouseY = objects.leftPaddle.height / 2;
			else if (mouseY >= canvas.height - (objects.leftPaddle.height / 2))
				mouseY = canvas.height - (objects.leftPaddle.height / 2);
			objects.leftPaddle.y = mouseY;
			resetCanvas(canvas, ctx);
			socket.emit('positions', {objects});
			drawPaddles(objects.rightPaddle, objects.leftPaddle, ctx, canvas, 'blue');
		});
	}

	onMount(() => {
		const canvas = document.getElementById('main-game-canvas') as HTMLCanvasElement;
		canvas.width = window.innerWidth - 10;
		canvas.height = window.innerHeight * 0.90 - 10;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		const socket = initData(canvas, ctx);
		ctx.fillStyle = 'black';
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		socket.on('startGame', (objects: { rightPaddle: any, leftPaddle: any, ball: any }) => {
			startGame(objects, ctx, canvas, socket)
		});
		socket.on('drawBall', (objects: {prev: any, curr: any}) => {
			drawBall({ x: objects.prev.x, y: objects.prev.y }, canvas, ctx, 'black');
			drawBall({ x: objects.curr.x, y: objects.curr.y }, canvas, ctx, 'blue');
		});
	});
</script>

<style>
	canvas:hover {
  		cursor: none;
	}
</style>

<canvas id="main-game-canvas" class="game-canvas">
</canvas>
