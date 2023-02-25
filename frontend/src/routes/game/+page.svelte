<script lang="ts">
	import Header from "../Header.svelte";
    import { onMount } from "svelte";
	import { AuthGuard } from "../../modules/AuthGuard";
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

	let isStarted = false;
	const startGame = () => {
  		isStarted = true;
	};
</script>

<section>
	<Button on:click={startGame}>Start game</Button>
	{#if isStarted}
	<div class="bg-gray-900">
		<p>Game launched</p>
	</div>
	{/if}
</section>
