<script lang="ts">
    import { API_URL } from "$lib/env";
    import { getJwt } from "$lib/jwtUtils";
    import { usersDataStore } from "$lib/store/user";
    import axios from "axios";
    import { afterUpdate, onMount } from "svelte";
    import GameHistory from "../../modules/htmlComponent/gameHistory.svelte";

	let gameHistory : any = null;
	let allUsers : any = [];
	let threeBestUsers: any = null;
	
	usersDataStore.subscribe(val => {
		allUsers = val;
		threeBestUsers = allUsers.slice().sort((a: any, b: any) => b.level - a.level).slice(0, 3);
	});
	
	onMount(async() => {
		await axios.get(`${API_URL}/users/get10GameHistory`, { headers : {
				Authorization : `Bearer ${getJwt()}`
			}
		})
		.then((res) => {
			if (!threeBestUsers || threeBestUsers.length < 3)
				gameHistory = res.data;
		})
	});
</script>

<div class="container-home container">
	<div class="img-home">
		<a href="/game">
			<img src="./img-home.png" alt="">
		</a>
	</div>
	{#if allUsers.length >= 3 && threeBestUsers}
		<div class="container-game">
			<h2 style="text-align: center">Rankings</h2>
		</div>
		<div class="ranking">
			<div class="rank-second">
				<h2 style="text-align: center">#2</h2>
				<strong><p style="text-align: center" class="ranking-login">{threeBestUsers[1].login}</p></strong>
				<div class="ranking-player-info">
					<p style="text-align: center" class ="win-rate-ranking">WR : {threeBestUsers[1].winrate}%</p>
					<p style="text-align: center" class ="level-ranking">Level {threeBestUsers[1].level}</p>
				</div>
			</div>
			<div class="rank-first">
				<h2 style="text-align: center">#1</h2>
				<strong><p style="text-align: center" class="ranking-login">{threeBestUsers[0].login}</p></strong>
				<div class="ranking-player-info">
					<p style="text-align: center" class ="win-rate-ranking">WR : {threeBestUsers[0].winrate}%</p>
					<p style="text-align: center" class ="level-ranking">Level {threeBestUsers[0].level}</p>
				</div>
			</div>
			<div class="rank-third">
				<h2 style="text-align: center">#3</h2>
				<strong><p style="text-align: center" class="ranking-login">{threeBestUsers[2].login}</p></strong>
				<div class="ranking-player-info">
					<p style="text-align: center" class ="win-rate-ranking">WR : {threeBestUsers[2].winrate}%</p>
					<p style="text-align: center" class ="level-ranking">Level {threeBestUsers[2].level}</p>
				</div>
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
