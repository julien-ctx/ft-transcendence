<script lang="ts">
	import "../app.scss";
    import "../app.postcss";
    import { page } from '$app/stores';
    import Header from "./Header.svelte";

</script> 

<div class="mx-auto">
	{#if $page.url.pathname != "/login"}
		<Header />
	{/if}
	<main class="h-full">
		<slot></slot>
	</main>
</div>