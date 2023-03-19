<script lang="ts">
    import { API_URL } from "$lib/env";
    import { getJwt } from "$lib/jwtUtils";
    import { usersDataStore } from "$lib/store/user";
    import axios from "axios";
    import { Avatar } from "flowbite-svelte";
    import { afterUpdate, onMount } from "svelte";
    import GameHistory from "../modules/htmlComponent/gameHistory.svelte";

	let gameHistory : any = null;
	let allUsers : any = [];
	let threeBestUsers: any = null;
	
	usersDataStore.subscribe(val => {
		allUsers = val;
		threeBestUsers = allUsers.slice().sort((a: any, b: any) => b.level - a.level).slice(0, 3);
	});
	
	onMount(async() => {
		if (getJwt() != undefined && getJwt() != "") {
			await axios.get(`${API_URL}/users/get10GameHistory`, { headers : {
					Authorization : `Bearer ${getJwt()}`
				}
			})
			.then((res) => {
				if (!threeBestUsers || threeBestUsers.length < 3)
					gameHistory = res.data;
			})
		}
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
				<p style="text-align: center; margin-top: auto;" class="ranking-login">{threeBestUsers[1].login}</p>
				<div class="ranking-player-info">
					<p class="win-rate-ranking"><span class="wr">WR :</span><span class="info">{threeBestUsers[1].winrate}%</span></p>
					<p class="level-ranking"><span class="level">Level : </span><span class="info">{threeBestUsers[1].level}</span></p>
				</div>
			</div>
			<div class="rank-first">
				<h2 style="text-align: center">#1</h2>
				<p style="text-align: center; margin-top: auto;" class="ranking-login">{threeBestUsers[0].login}</p>
				<div class="ranking-player-info">
					<p class="win-rate-ranking"><span class="wr">WR : </span><span class="info">{threeBestUsers[0].winrate}%</span></p>
					<p class="level-ranking"><span class="level">Level : </span><span class="info">{threeBestUsers[0].level}</span></p>
				</div>
			</div>
			<div class="rank-third">
				<h2 style="text-align: center">#3</h2>
				<p style="text-align: center; margin-top: auto;" class="ranking-login">{threeBestUsers[2].login}</p>
				<div class="ranking-player-info">
					<p class="win-rate-ranking"><span class="wr">WR :</span><span class="info">{threeBestUsers[2].winrate}%</span></p>
					<p class="level-ranking"><span class="level">Level : </span><span class="info">{threeBestUsers[2].level}</span></p>
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
