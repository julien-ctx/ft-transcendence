<script lang="ts">
    import { goto } from "$app/navigation";
    import { removeJwt } from "$lib/jwtUtils";
    import { onMount } from "svelte";
	import { UpdateProfileConnected, UpdateProfileToStore } from '$lib/profileUtils';

	onMount(() => {
		UpdateProfileConnected(0)
		.then((res) => {
			UpdateProfileToStore(res.data);
		});
		// removeJwt();
		goto("/login");
	})
</script>

<div>
	logout
</div>