<script lang="ts">
    import { onMount } from "svelte";
    import { removeJwt } from "$lib/jwtUtils";
    import { goto } from "$app/navigation";
    import { UpdateProfileConnected, UpdateProfileToStore } from "$lib/profileUtils";

	onMount(() => {
		UpdateProfileConnected(0)
		.then((res) => {
			UpdateProfileToStore(res.data);
		});
		removeJwt();
		goto("/login");

	})
</script>