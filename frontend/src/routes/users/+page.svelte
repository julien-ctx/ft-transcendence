<script lang="ts">
	import { Avatar, Card, Button, Dropdown, DropdownItem, MenuButton, Search } from "flowbite-svelte";
    import { onMount } from 'svelte';
    import { myProfileDataStore, usersDataStore } from '$lib/store/user';
    import { socketFriendStore, socketUserStore } from '$lib/store/socket';
    import { buttonClass, secondaryButtonClass, inputClass } from '$lib/classComponent';
    import { GetAllUsers } from "$lib/userUtils";

	let allUsers : any;
	let socketFriend : any;
	let socketUser : any;
	let myProfile : any;
	let usersComponent : any = [];
	let searchInput : string = "";

	myProfileDataStore.subscribe(val => myProfile = val)
	usersDataStore.subscribe(val => allUsers = val);
	socketFriendStore.subscribe(val => socketFriend = val);
	socketUserStore.subscribe(val => socketUser = val);


	onMount(async () => {
		await GetAllUsers()
		.then((res) => {
			usersComponent = res.data;
		})
		
	})

	function handleClickAcceptFriend(user : any) {
		let notif : any;
		myProfile.notification.forEach((elem : any) => {
			if (elem.type == 0 && elem.id_user_send == user.id)
				notif = elem;
		});
		socketFriend.emit("accept_friend", { user : myProfile, notif});
	}

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

<div class="p-10">
	<div class="container mx-auto gap-10 max-w-screen-xl">
		<Search bind:value={searchInput} on:input={handleChange} size="md" class={inputClass + " mb-10"} placeholder="Search user..."/>
		{#each usersComponent as user}
			{#if user.login != undefined}
				<div class="bg-secondary border-secondary w-full mt-5 rounded">
					<div class="absolute top-0 z-50">
						<MenuButton />
						<Dropdown class="w-36">
							{#if myProfile.block_id && myProfile.block_id.includes(user.id)}
								<DropdownItem on:click={() => socketUser.emit("unblock_user", { id_user_send : myProfile.id, id_user_receive : user.id})}>Unblock this user</DropdownItem>
							{:else}
								<DropdownItem on:click={() => socketUser.emit("block_user", { id_user_receive : user.id, id_user_send : myProfile.id})}>Block this user</DropdownItem>
							{/if}
						</Dropdown>
					</div>
					<div class="flex flex-row items-center pb-4 gap-2">
						<Avatar size="lg" src={user.img_link} class="object-cover" />
						<h5 class="mb-1 text-xl font-medium text-gray-900 dark:text-white">{user.login}</h5>
						<span class="text-sm text-gray-500 dark:text-gray-400 h-3">{user.kind}</span>
						<div class="flex mt-4 space-x-3 lg:mt-6">

						{#if myProfile.block_id && myProfile.block_id.includes(user.id)}
							<Button on:click={() => socketUser.emit("unblock_user", { id_user_send : myProfile.id, id_user_receive : user.id})}>Unblock this user</Button>
						{:else}
							{#if user.block_id && user.block_id.includes(myProfile.id)}
								<div>This user blocked you</div>
							{:else}
								{#if myProfile.req_send_friend && myProfile.req_send_friend.includes(user.id)}
									<div>Pending request friend</div>
									<Button class={buttonClass} on:click={() => socketFriend.emit("cancel_friend", {id_user_send : myProfile.id, id_user_receive : user.id})}>Cancel request</Button>
								{:else if myProfile.req_received_friend && myProfile.req_received_friend.includes(user.id)}
									<Button on:click={() => handleClickAcceptFriend(user)}>Accept request friend</Button>
								{:else if myProfile.friend_id && myProfile.friend_id.includes(user.id)}
									<Button class={buttonClass} on:click={() => socketFriend.emit('delete_friend', { id_user_send : myProfile.id, id_user_receive : user.id})}>Delete friend</Button>
								{:else}
									<Button class={buttonClass} on:click={() => socketFriend.emit('add_friend', { user_send : myProfile, user_receive : user})}>Add friend</Button>
								{/if}
								<Button class={secondaryButtonClass}>Message</Button>
							{/if}
						{/if}
						</div>
					</div>
				</div>
				<Button href="/user?id={user.id}">Profile</Button>
			{/if}
		{/each}
	</div>
</div>