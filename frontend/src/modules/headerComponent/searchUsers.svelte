<script lang="ts">
	import { Button, Search, Card, Avatar } from 'flowbite-svelte'
    import { userProfileDataStore, usersDataStore } from '$lib/store/user';
    import { GetOneUser } from '$lib/userUtils';

	let allUsers : any;
	let userProfile : any;
	let usersComponent : any = [];
	let searchInput : string = "";

	usersDataStore.subscribe(val => allUsers = val);
	userProfileDataStore.subscribe(val => userProfile = val);

	function handleChange() {
		if (searchInput !== "") {
			allUsers.forEach((elem : any) => {
				const toComp = elem.login.substr(0, searchInput.length);
				if (toComp == searchInput && elem.id != userProfile.id) {
					if (!usersComponent.includes(elem)) {
						usersComponent.push(elem);
					}
				}
				else if (usersComponent.includes(elem)){
					usersComponent.pop(elem);
				}
			});
		} else
			usersComponent = []
		usersComponent = usersComponent;
	}

	async function handleClick(user : any){
		await GetOneUser(user.id)
		.then((res) => {
			userProfileDataStore.set(res.data);
		})
		usersComponent = [];
		searchInput = "";
	}
</script>

<div>
	<div class="flex gap-2">
		<Search bind:value={searchInput} on:input={handleChange}/>
		<Button size='sm'>
			<svg class="w-5 h-5 mr-2 -ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
			Search
		</Button>
	</div>
	<div class="static">
		<div class="absolute flex gap-2 flex-col">
			{#each usersComponent as user}
			<a href={`/users?id=${user.id}`} on:click={() => handleClick(user)}>
				<Card horizontal class="static">
					<Avatar src={user.img_link} class="object-cover"/>
					<h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{user.login}</h5>
				</Card>
			</a>
			{/each}
		</div>
	</div>
</div>


