<script lang="ts">
    import { getJwt } from "$lib/jwtUtils";
    import { UpdateProfileImg, UpdateProfileLogin } from "$lib/profileUtils";
    import axios from "axios";
    import { onMount } from "svelte";
    import { bubble } from "svelte/internal";
    import { AuthGuard } from "../../modules/AuthGuard";

	let user : any;

	let fileInput : any;
	let loginSave : any;

	let isEditLogin : boolean = false;

	onMount(() => {
		AuthGuard()
		.then((res) => {
			user = res.data;
			loginSave = user.login;
			if (user.img_link.includes("/Users")) {
				const path = user.img_link.split("/");
				user.img_link = `/${path[path.length - 1]}`
			}
		})
		.catch((err) => console.log(err));
	});

	async function submitFormImg() {
		const formData = new FormData();
		formData.append('file', fileInput.files[0]);
		UpdateProfileImg(formData)
		.then((res) => {
			user = res.data;
			loginSave = user.login;
			if (user.img_link.includes("/Users")) {
				const path = user.img_link.split("/");
				user.img_link = `/${path[path.length - 1]}`
			}
		})
		.catch((err) => console.log(err));
	}

	async function submitFormLogin() {
		console.log(loginSave == user.login);
		if (loginSave != user.login) {
			UpdateProfileLogin(loginSave)
			.then((res) => {
				user = res.data;
				loginSave = user.login;
				if (user.img_link.includes("/Users")) {
					const path = user.img_link.split("/");
					user.img_link = `/${path[path.length - 1]}`
				}
				isEditLogin = false;
			})
			.catch((err) => console.log(err));
		}
	}

</script>
{#if user}
	<img src={user.img_link} alt={user.login}>
	<label for="file">
		<img src="/stylo-modifier.png" alt="">
		<input type="file" bind:this={fileInput} on:change={submitFormImg} class="hidden" name="file" id="file">
	</label>
	{#if !isEditLogin}
		<div>{user.login}</div>
		<button on:click={() => isEditLogin = true}><img src="/stylo-modifier.png" alt=""></button>
	{:else}
		<input type="text" bind:value={loginSave}>
		<button on:click={() => isEditLogin = false}><img src="/signe-de-la-croix.png" alt="" width="24"></button>
		<button on:click={submitFormLogin}><img src="/check.png" alt="" width="24"></button>
	{/if}
	<div>{user.first_name}</div>
	<div>{user.last_name}</div>
	<div>{user.email}</div>
{/if}
<!-- <form on:submit|preventDefault={submitForm}> -->
	<!-- <button>Submit</button> -->
<!-- </form> -->