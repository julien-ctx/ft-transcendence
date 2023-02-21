<script lang="ts">
    import { getJwt } from "$lib/getJwt";
    import axios from "axios";
    import { onMount } from "svelte";

	onMount(async () => {
		let jwt : string = getJwt();
		console.log(jwt);
		await axios.get("http://localhost:4000/users/me", {
			headers :
			{
				Authorization: `Bearer ${getJwt()}`
			}
		})
		.then((res) => {
			console.log(res);
		})
		.catch((err) => {
			console.log(err);
		})
		// AuthGuard()
		// .then((res) => {
		// 	user.isLogged = true;
		// 	console.log(res);
		// });
	});
</script>
<section>
	game
</section>