<script lang="ts">
    import { usersDataStore } from "$lib/store/user";
    import { Avatar } from "flowbite-svelte";


	export let gameHistory : any;
	let allUsers : any;
	
	usersDataStore.subscribe(val => allUsers = val);
	function getUser(id : any) {
		for (let i = 0; i < allUsers.length; i++) {
			if (allUsers[i].id == id)
				return allUsers[i];
		}
	}
</script>
{#key allUsers}
	{#each gameHistory as game}
		{#if game.user && game.user.length == 2 && getUser(game.id_user1) && getUser(game.id_user2)}
			<div class="flex justify-between items-center max-w-lg shadow-md p-5 rounded">
				<div>
					<Avatar size="lg" src={getUser(game.id_user1).img_link} class="object-cover bg-transparent" rounded/>
					<p class="capitalize font-medium text-center">{getUser(game.id_user1).login}</p>
				</div>
				<div class="flex flex-col items-center">
					<p class="font-bold text-3xl">VS</p>
					{#if game.id_user_winner === game.id_user1}
						<p class="font-medium text-2xl"><span class="text-green-500">{game.score_user1}</span> - <span class="text-red-500">{game.score_user2}</span></p>
					{:else}
						<p class="font-medium text-2xl"><span class="text-red-500">{game.score_user1}</span> - <span class="text-green-500">{game.score_user2}</span></p>
					{/if}
				</div>
				<div>
					<Avatar size="lg" src={getUser(game.id_user2).img_link} class="object-cover bg-transparent" rounded/>
					<p class="capitalize font-medium text-center">{getUser(game.id_user2).login}</p>
				</div>
			</div>
		{/if}
	{/each}
{/key}