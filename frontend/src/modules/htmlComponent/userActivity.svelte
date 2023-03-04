<script lang="ts">
	import { Indicator } from "flowbite-svelte";

	export let user : any;
</script>

{#if user.activity === 0}
	<div class="flex gap-2 items-center">
		<Indicator color="red"/>
		<p>Offline</p>
	</div>
{:else if user.activity === 1}
	<div class="flex gap-2 items-center">
		<Indicator color="green"/>
		<p>Online</p>
	</div>
{:else if user.activity === 2}
	<div class="flex gap-2 items-center">
		<Indicator color="blue"/>
		<p>In game</p>
	</div>
{/if}