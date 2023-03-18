<script lang="ts">
    import { API_URL } from "$lib/env";
    import { getJwt } from "$lib/jwtUtils";
    import { usersDataStore } from "$lib/store/user";
    import axios from "axios";
    import { afterUpdate, onMount } from "svelte";
    import GameHistory from "../modules/htmlComponent/gameHistory.svelte";

	let gameHistory : any;
	let allUsers : any = [];
	let threeBestLevels: any;
	
	usersDataStore.subscribe(val => allUsers = val);
	
	threeBestLevels = [...allUsers].sort((a, b) => a.level - b.level).slice(-3);
	onMount(async() => {
		await axios.get(`${API_URL}/users/get10GameHistory`, { headers : {
				Authorization : `Bearer ${getJwt()}`
			}
		})
		.then((res) => {
			gameHistory = res.data;
		})
	})
</script>

<div class="container-home container">
	<div class="img-home">
		<a href="/game">
			<img src="./img-home.png" alt="">
		</a>
	</div>
		
	{#if allUsers.length >= 3}
		<div class="container-game">
			<h2 style="text-align: center">Rankings</h2>
		</div>
		<div class="ranking">
			<div class="rank-second">
				<h2 style="text-align: center">#2</h2>
				<strong><p style="text-align: center">{threeBestLevels[1].login}</p></strong>
				<strong><p style="text-align: center" class ="win-rate-ranking">WR: {threeBestLevels[1].winrate} %</p></strong>
				<strong><p style="text-align: center">Level {threeBestLevels[1].level}</p></strong>
			</div>
			<div class="rank-first">
				<h2 style="text-align: center">#1</h2>
				<strong><p style="text-align: center">{threeBestLevels[2].login}</p></strong>
				<strong><p style="text-align: center" class ="win-rate-ranking">WR: {threeBestLevels[2].winrate} %</p></strong>
				<strong><p style="text-align: center">Level {threeBestLevels[2].level}</p></strong>
			</div>
			<div class="rank-third">
				<h2 style="text-align: center">#3</h2>
				<strong><p style="text-align: center">{threeBestLevels[0].login}</p></strong>
				<strong><p style="text-align: center" class ="win-rate-ranking">WR: {threeBestLevels[0].winrate} %</p></strong>
				<strong><p style="text-align: center">Level {threeBestLevels[0].level}</p></strong>
			</div>
		</div>
	{:else if gameHistory}
		<div class="container-game">
			<h2 style="text-align: center">Last games</h2>
			<div class="content-game">
				<GameHistory gameHistory={gameHistory} />
			</div>
		</div>
	{/if}
</div>
