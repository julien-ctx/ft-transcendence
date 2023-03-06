<script lang="ts">
	import "../app.scss";
    import "../app.postcss";
    import { page } from '$app/stores';
    import Header from "./Header.svelte";

</script> 

<div class="mx-auto h-full">
	{#if $page.url.pathname != "/login"}
		<Header />
	{/if}
	<main>
		<slot></slot>
	</main>
</div>