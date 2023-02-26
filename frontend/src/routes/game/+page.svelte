<script lang="ts">
	import Header from "../Header.svelte";
    import { onMount } from "svelte";
	import { AuthGuard } from "../../modules/AuthGuard";
    import { goto } from "$app/navigation";
    import { removeJwt } from "$lib/jwtUtils";
	
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
</script>

<section>
	game
	{#if isLogged}
		gg tes loggin mec
	{/if}
</section>