<script>
    import { removeJwt } from "$lib/jwtUtils";
    import { onMount } from "svelte";

	onMount(() => {
		removeJwt();
	})
</script>

<div>
	logout
</div>