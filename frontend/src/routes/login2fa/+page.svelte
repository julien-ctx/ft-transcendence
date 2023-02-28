<script lang="ts">
    import { AuthGuard } from "$lib/AuthGuard";
    import { getJwt } from "$lib/jwtUtils";
    import axios from "axios";
    import { onMount } from "svelte";

	let imgSrc : string;
	let code2fa : string;
	let user : any;
	onMount(async () => {
		await AuthGuard()
		.then(async (res) => {
			user = res.data;
			await axios.get("http://localhost:4000/auth/2fa/getQrCode", {
				headers: {
					Authorization : `Bearer ${getJwt()}`
			}})
			.then((res) => {
				imgSrc = res.data;
			})
		})
	})

	async function handleSubmit() {
		console.log(code2fa);
		await axios.post("http://localhost:4000/auth/2fa/login", {code2fa}, {
			headers: {
				Authorization : `Bearer ${getJwt()}`
		}})
		.then((res) => {
			console.log(res);
			
		})
	}
</script>

<div>
	<img src={imgSrc} alt="">
	<input bind:value={code2fa} />
	<button on:click={handleSubmit}>Submit</button>
</div>