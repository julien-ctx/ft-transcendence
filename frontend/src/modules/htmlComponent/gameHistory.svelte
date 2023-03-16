<script lang="ts">
    import { Avatar } from "flowbite-svelte";

	export let gameHistory : any;
	
</script>

{#each gameHistory as game}
	{#if game.user[0] && game.user[1]}	
		<div class="flex justify-between items-center max-w-lg shadow-md p-5 rounded">
			<div>
				<Avatar size="lg" src={game.user[0].img_link} class="object-cover bg-transparent" rounded/>
				<p class="capitalize font-medium text-center">{game.user[0].login}</p>
			</div>
			<div class="flex flex-col items-center">
				<p class="font-bold text-3xl">VS</p>
				{#if game.score_user1 > game.score_user2}
					<p class="font-medium text-2xl"><span class="text-green-500">{game.score_user1}</span> - <span class="text-red-500">{game.score_user2}</span></p>
				{:else}
					<p class="font-medium text-2xl"><span class="text-red-500">{game.score_user1}</span> - <span class="text-green-500">{game.score_user2}</span></p>
				{/if}
			</div>
			<div>
				<Avatar size="lg" src={game.user[1].img_link} class="object-cover bg-transparent" rounded/>
				<p class="capitalize font-medium text-center">{game.user[1].login}</p>
			</div>
		</div>
	{/if}
{/each}
