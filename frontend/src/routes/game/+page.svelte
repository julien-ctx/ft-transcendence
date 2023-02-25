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
	let buttonClicked = false;

	const startGame = () => {
  		isStarted = true;
	};

</script>

<style>
	.game-frame {
		width: 100vw;
		height: 80vh;
		background-color: black;
		box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
		display: flex;
		justify-content: center;
		align-items: center;

	}

	.game-frame p {
		color: white;	
	}
</style>

<div>
	<div class="bg-gray-900 game-frame">
	  {#if !buttonClicked}
		<Button on:click={() => {buttonClicked = true; startGame();}}>Start game</Button>
	  {/if}
	  {#if isStarted}
		<p>Game launched</p>
	  {/if}
	</div>
  </div>
  
