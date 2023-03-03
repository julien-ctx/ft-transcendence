<script lang="ts">
	import { Search } from "flowbite-svelte";
    import { usersDataStore } from '$lib/store/user';
    import { onMount } from "svelte";
    import { GetAllUsers } from "$lib/userUtils";
    import UserCard from "../../modules/htmlComponent/userCard.svelte";


	let allUsers : any = [];
	let usersComponent : any = [];
	let searchInput : string = "";

	usersDataStore.subscribe(val => allUsers = val);

	onMount(async () => {
		await GetAllUsers()
		.then((res) => {
			usersComponent = res.data;
		})
	});

	function handleChange() {
		if (searchInput !== "") {
			usersComponent = [];
			if (allUsers) {
				for (let i = 0; i < allUsers.length; i++) {
					if (allUsers[i].login) {
						const toComp = allUsers[i].login.substr(0, searchInput.length);
						if (toComp === searchInput) {
							if (!usersComponent.includes(allUsers[i])) {
								usersComponent.push(allUsers[i]);
							}
						}
						else if (usersComponent.includes(allUsers[i])){
							usersComponent.splice(i, 1);
						}
					}
				}
			}
		} else
			usersComponent = allUsers;
		usersComponent = usersComponent;
	}
</script>

<div class="p-10 container mx-auto gap-10 max-w-screen-xl">
	<Search placeholder="Search by nickname" bind:value={searchInput} on:input={handleChange}/>
	<div class="flex flex-col gap-5 mt-10">
		<div class="gap-4 grid-cols-6 text-center hidden sm:grid">
			<div>Picture</div>
			<div>Nickname</div>
			<div>Activity</div>
			<div>Win rate</div>
			<div>Ranking</div>
			<div>Actions</div>
		</div>
		{#each usersComponent as user}
			{#if user.login != undefined}
				<UserCard user={user}/>
			{/if}
		{/each}
	</div>
</div>