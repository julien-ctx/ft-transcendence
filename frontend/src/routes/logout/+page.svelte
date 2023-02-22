<script>
    import { goto } from "$app/navigation";
    import { removeJwt } from "$lib/jwtUtils";
    import { onMount } from "svelte";

	onMount(() => {
		removeJwt();
		goto("/login");
	})
</script>

<div>
	logout
</div>