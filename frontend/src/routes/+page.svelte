<script lang="ts">
    import { API_URL } from "$lib/env";
    import { getJwt } from "$lib/jwtUtils";
    import axios from "axios";
    import { afterUpdate, onMount } from "svelte";
    import GameHistory from "../modules/htmlComponent/gameHistory.svelte";

	let gameHistory : any;

	onMount(async() => {
		await axios.get(`${API_URL}/users/get10GameHistory`, { headers : {
				Authorization : `Bearer ${getJwt()}`
			}
		})
		.then((res) => {
			gameHistory = res.data
		})
	})

</script>
<div class="container-home container">
	<div>
		<a href="/game">
			<img src="./img-home.png" alt="" style="margin: 0 auto;" class="img-home">
		</a>
	</div>
	{#if gameHistory}
		<div class="container-game">
			<h2 style="text-align: center">Last games</h2>
			<div class="content-game">
				<GameHistory gameHistory={gameHistory} />
			</div>
		</div>
	{/if}
</div>
