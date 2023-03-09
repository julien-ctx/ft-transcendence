<script lang="ts">
	import "../app.scss";
    import "../app.postcss";
    import { page } from '$app/stores';
    import Header from "./Header.svelte";
    import MpEach from "../modules/htmlComponent/mpComponent/mpEach.svelte";

</script> 

<div class="mx-auto relative">
	{#if $page.url.pathname != "/login"}
		<Header />
	{/if}
	<main class="h-full">
		<slot></slot>
	</main>
	{#if $page.url.pathname != "/login"}
		<MpEach />
	{/if}
</div>