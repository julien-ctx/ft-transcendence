<script lang="ts">
    import { onMount } from "svelte";
    import { AuthGuard } from "../../modules/AuthGuard";
	let user : any;
	let isEdit : boolean = false;

	onMount(() => {
		AuthGuard()
		.then((res) => {
			console.log(res.data);
			user = res.data;
			
		})
		.catch((err) => console.log(err));
	})
	function editProfile() {
		console.log(user);
		isEdit = false;
	}
</script>

<div>
	{#if user}
		{#if !isEdit}
			<img src={user.img_link} alt="" width="300">
			<div>Login : {user.login}</div>
			<div>Prenom : {user.first_name}</div>
			<div>Nom : {user.last_name}</div>
			<div>Email : {user.email}</div>
			<button on:click={() => isEdit = true}>Modifier</button>
		{:else}
			<form action="" method="post">
				<img src={user.img_link} alt="" width="300">
				<div>
					<input type="text" bind:value={user.login}>
				</div>
				<div>
					<input type="text" bind:value={user.first_name}>
				</div>
				<div>
					<input type="text" bind:value={user.last_name}>
				</div>
				<div>
					<input type="text" bind:value={user.email}>
				</div>
				<button on:click={editProfile}>Terminer</button>
			</form>
			<button on:click={() => isEdit = false}>Cancel</button>
		{/if}

	{/if}
</div>