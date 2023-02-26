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

	function setObjectSize(canvas: HTMLCanvasElement) {
		const rightPaddle = new Paddle (
			canvas.width - canvas.width * 0.1,
			canvas.height - canvas.height * 0.1,
			canvas.width - canvas.width * 0.01,
			canvas.height - canvas.height * 0.4,
		);
		const leftPaddle = new Paddle (
			canvas.width * 0.1,
			canvas.height * 0.1,
			canvas.width * 0.01,
			canvas.height * 0.4,
		);
		const ball = new Ball (
			canvas.width * 0.5,
			canvas.height * 0.5,
			canvas.width * 0.01,
		);
		const socket = io('http://localhost:4000');
		socket.emit('setObjectSize', { rightPaddle, leftPaddle, ball });
	}

	onMount(() => {
		const canvas = document.getElementById('main-game-canvas') as HTMLCanvasElement;
		canvas.width = window.innerWidth - 10;
		canvas.height = window.innerHeight * 0.85 - 10;
		setObjectSize(canvas);
		const ctx = canvas.getContext('2d');
		if (ctx) {
			ctx.fillStyle = 'black';
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			canvas.style.border = '5px solid #999';
		}
	});

</script>

<canvas id="main-game-canvas" class="game-canvas">
	<p>Game started</p>
</canvas>
