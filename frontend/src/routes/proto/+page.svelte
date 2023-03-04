<script lang="ts">
	import { Button } from "flowbite-svelte";
	import { onMount } from "svelte";


	let show : boolean = false;

	function test() {
		show = true;
	}
</script>




<div class="relative h-full">
	{#if show}
		<div class="absolute top-0 bottom-0 right-0 w-1/3 h-screen bg-gray-100 w-2/3 mr-4">
			<div class="flex justify-between gap-3">
				<h1>Channels</h1>
				<h1>Users</h1>
			</div>	
		</div>
	{/if}
	{#if !show}
	<div class="absolute bottom-0 right-0">	
		<button class="flex justify-center bg-white rounded w-24" on:click={test}>
			<span>Messagerie</span>
		</button>
	</div>
	{/if}
</div>