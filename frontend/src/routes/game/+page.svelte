<script lang="ts">
	import Header from "../Header.svelte";
    import { onMount } from "svelte";
	import { AuthGuard } from "../../lib/AuthGuard";
    import { goto } from "$app/navigation";
    import { removeJwt } from "$lib/jwtUtils";
	import { Button } from 'flowbite-svelte'
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

	onMount(() => {
		const canvas = document.getElementById('main-game-canvas') as HTMLCanvasElement;
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight * 0.85;
		const ctx = canvas.getContext('2d');
		if (ctx) {
			ctx.fillStyle = 'black';
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			ctx.fillStyle = 'blue';
			ctx.fillRect(20, 20, 10, 100);
		}
	});

</script>

<canvas id="main-game-canvas" class="game-canvas">
	<p>Game started</p>
</canvas>
