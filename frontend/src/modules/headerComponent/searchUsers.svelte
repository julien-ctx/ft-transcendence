<script lang="ts">
	import { Button, Search, Card, Avatar } from 'flowbite-svelte'
    import { userProfileDataStore, usersDataStore } from '$lib/store/user';
    import { GetOneUser } from '$lib/userUtils';
    import { inputClass, buttonClass } from '$lib/classComponent'

	let allUsers : any;
	let userProfile : any;
	let usersComponent : any = [];
	let searchInput : string = "";

	usersDataStore.subscribe(val => allUsers = val);
	userProfileDataStore.subscribe(val => userProfile = val);

	function handleChange() {
		if (searchInput !== "") {
			if (allUsers && allUsers.length > 0) {
				allUsers.forEach((elem : any) => {
					if (elem.login) {
						const toComp = elem.login.substr(0, searchInput.length);
						if (toComp == searchInput && elem.id != userProfile.id) {
							if (!usersComponent.includes(elem)) {
								usersComponent.push(elem);
							}
						}
						else if (usersComponent.includes(elem)){
							usersComponent.pop(elem);
						}
					}
				});
			}
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

<Search bind:value={searchInput} on:input={handleChange} size="md" class={inputClass} placeholder="Search user..."/>
<div class="relative">
	<div class="absolute flex gap-2 flex-col left-0 right-0 top-3" style="z-index: 1000;">
		{#each usersComponent as user}
		<a href={`/users?id=${user.id}`} on:click={() => handleClick(user)}>
			<Card horizontal class="gap-5 !bg-secondary !opacity-100">
				<Avatar src={user.img_link} class="object-cover"/>
				<h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{user.login}</h5>
			</Card>
		</a>
		{/each}
	</div>
</div>


