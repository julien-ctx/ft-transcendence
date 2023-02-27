<script lang="ts">
	import { onMount } from "svelte";
	import { AuthGuard } from "../../lib/AuthGuard";
    import { goto } from "$app/navigation";
    import { removeJwt } from "$lib/jwtUtils";
	import { Button } from 'flowbite-svelte';
	import io from 'socket.io-client';
	import { Paddle, Ball } from '../../../../backend/src/game/objects/objects';
	
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

	function initData(canvas: HTMLCanvasElement) {
		const rightPaddle = new Paddle (
			canvas.width - canvas.width * 0.015,
			canvas.height - canvas.height * 0.5,
			canvas.width * 0.005,
			canvas.height * 0.15,
		);
		const leftPaddle = new Paddle (
			canvas.width * 0.015,
			canvas.height * 0.5,
			canvas.width * 0.005,
			canvas.height * 0.15,
		);
		const ball = new Ball (
			canvas.width * 0.5,
			canvas.height * 0.5,
			canvas.width * 0.01,
		);
		const socket = io('http://localhost:4000');
		socket.emit('setObjectSize', { rightPaddle, leftPaddle, ball });
		return socket;
	}

	function drawPaddles(rightPaddle: Paddle, leftPaddle: Paddle, ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
		ctx.fillStyle = 'blue';
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
		ctx.fillRect(canvas.width / 2 - 1, 0, 2, canvas.height);
	}

	function drawObjects(objects: any, ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
		drawPaddles(objects.rightPaddle, objects.leftPaddle, ctx, canvas)
	}

	onMount(() => {
		const canvas = document.getElementById('main-game-canvas') as HTMLCanvasElement;
		canvas.width = window.innerWidth - 10;
		canvas.height = window.innerHeight * 0.90 - 10;
		const socket = initData(canvas);
		const ctx = canvas.getContext('2d');
		if (ctx) {
			ctx.fillStyle = 'black';
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			canvas.style.border = '5px solid #999';
			socket.on('objectSizeSet', (objects: { rightPaddle: Paddle, leftPaddle: Paddle, ball: Ball }) => {
				drawObjects(objects, ctx, canvas)
				canvas.addEventListener('mousemove', (event) => {
					let obj = objects;
					let mouseY = event.clientY - canvas.offsetTop;
					if (mouseY <= obj.leftPaddle.height / 2)
						mouseY = obj.leftPaddle.height / 2;
					else if (mouseY >= canvas.height - (obj.leftPaddle.height / 2))
						mouseY = canvas.height - (obj.leftPaddle.height / 2)
					obj.leftPaddle.y = mouseY;
					ctx.fillStyle = 'black';
					ctx.fillRect(0, 0, canvas.width, canvas.height);
					socket.emit('setObjectSize', {obj});	
					drawObjects(obj, ctx, canvas);
				});
			});
		}
	});
</script>

<style>
	canvas:hover {
  		cursor: none;
	}
</style>

<canvas id="main-game-canvas" class="game-canvas">
	<p>Game started</p>
</canvas>
