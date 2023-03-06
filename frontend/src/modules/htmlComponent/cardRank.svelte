<script lang="ts">
    import { levelObj } from '$lib/levelUtils';
	import { Card, Progressbar, Tooltip } from 'flowbite-svelte'
    import { onMount } from 'svelte';

	export let user : any;

	let percent : string = "0";
	let xpMatch : string = "0/200"
	onMount(() => {
		if (user.exp != 0) {
			if (user.level != 5) {
				percent = (Math.trunc((user.exp / levelObj[user.level + 1]) * 100)).toString();
				xpMatch = user.exp + "/" + levelObj[user.level + 1];
			} else {
				percent = (Math.trunc((user.exp / levelObj[user.level]) * 100)).toString();
				xpMatch = user.exp + "/" + levelObj[user.level];
			}

		}
	})
</script>

<Card padding="none" class="!bg-primary !border-none p-10 justify-between gap-5">
		<div class="flex flex-col gap-5 justify-center items-center mb-5">
			{#if user.ranking == 0}
				<img src="/badge-bronze.png" alt="" width="90">
			{:else if user.ranking == 1}
				<img src="/badge-silver.png" alt="" width="90">
			{:else if user.ranking == 2}
				<img src="/badge-gold.png" alt="" width="90">
			{/if}
		</div>
		<div class="flex justify-between">
			{#if user.winrate <= 50.0}
				<div class="flex items-center justify-center text-red-700 flex-wrap gap-2">
					<p class="font-medium block">WR :</p>
					<p>{user.winrate}%</p>
				</div>
			{:else if user.winrate <= 65.0}
				<div class="flex items-center justify-center text-orange-400 flex-wrap gap-2">
					<p class="font-medium block">WR :</p>
					<p>{user.winrate}%</p>
				</div>
			{:else}
				<div class="flex items-center justify-center text-green-600 flex-wrap gap-2">
					<p class="font-medium block">WR :</p>
					<p>{user.winrate}%</p>
				</div>
			{/if}
			<p class="font-medium">105 Games</p>
		</div>
		<div>
			<Progressbar id="progress" progress={percent} labelOutside="Level {user.level} - {xpMatch}" class="progress-label"/>
		</div>
</Card>