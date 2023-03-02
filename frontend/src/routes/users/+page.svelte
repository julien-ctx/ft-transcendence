<script lang="ts">
    import { GetOneUser } from '$lib/userUtils';
	import { Avatar, Card, Button, Dropdown, DropdownItem, MenuButton } from "flowbite-svelte";
    import { onMount } from 'svelte';
    import { myProfileDataStore, userProfileDataStore, usersDataStore } from '$lib/store/user';
    import { socketFriendStore, socketUserStore } from '$lib/store/socket';
    import SearchUsers from '../../modules/headerComponent/searchUsers.svelte';
    import { buttonClass, secondaryButtonClass } from '$lib/classComponent';

	let allUsers : any;
	let hasId : boolean = false;
	let userProfile : any;
	let socketFriend : any;
	let socketUser : any;
	let myProfile : any;

	myProfileDataStore.subscribe(val => myProfile = val)
	userProfileDataStore.subscribe(val => userProfile = val);
	usersDataStore.subscribe(val => allUsers = val);
	socketFriendStore.subscribe(val => socketFriend = val);
	socketUserStore.subscribe(val => socketUser = val);

	onMount(async () => {		
		const urlParams = new URLSearchParams(window.location.search);
		hasId = urlParams.has("id");
		if (hasId) {
			let id : any = urlParams.get("id");
			await GetOneUser(id)
			.then((res) => {
				userProfileDataStore.set(res.data);
			});
		}
	})

	function handleClickAcceptFriend() {
		let notif : any;
		myProfile.notification.forEach((elem : any) => {
			if (elem.type == 0 && elem.id_user_send == userProfile.id)
				notif = elem;
		});
		socketFriend.emit("accept_friend", { user : myProfile, notif});
	}
</script>

<div class="pb-20">
	<div class="max-w-xs mx-auto mt-5">
		<SearchUsers/>
	</div>
	{#if userProfile.id}
		<div class="container mx-auto flex items-center flex-col">
			<Card padding="sm" size="md">
				<div class="flex items-center space-x-4">
					<Avatar size="xl" src={userProfile.img_link} class="object-cover"/>
					<div class="space-y-1 font-medium dark:text-white">
						{#if userProfile.status == 0}
							<div>Disconnected</div>
						{:else if userProfile.status == 1}
							<div>Connected</div>
						{:else if userProfile.status == 2}
							<div>In game</div>
						{/if}
						<div>Login: {userProfile.login}</div>
						<div>Firstname: {userProfile.first_name}</div>
						<div>Lastname: {userProfile.last_name}</div>
						<div>Email: {userProfile.email}</div>
					</div>
				</div>
				{#if myProfile.block_id && myProfile.block_id.includes(userProfile.id)}
					<Button on:click={() => socketUser.emit("unblock_user", { id_user_send : myProfile.id, id_user_receive : userProfile.id})}>Unblock this user</Button>
				{:else}
					<Button on:click={() => socketUser.emit("block_user", { id_user_receive : userProfile.id, id_user_send : myProfile.id})}>Block this user</Button>
				{/if}
				{#if userProfile.block_id && userProfile.block_id.includes(myProfile.id)}
					<div>This user blocked you</div>
				{:else}
					{#if myProfile.req_send_friend && myProfile.req_send_friend.includes(userProfile.id)}
						<div>Pending request friend</div>
						<Button on:click={() => socketFriend.emit("cancel_friend", {id_user_send : myProfile.id, id_user_receive : userProfile.id})}>Cancel request</Button>
					{:else if myProfile.req_received_friend && myProfile.req_received_friend.includes(userProfile.id)}
						<Button on:click={handleClickAcceptFriend}>Accept request friend</Button>
					{:else if myProfile.friend_id && myProfile.friend_id.includes(userProfile.id)}
						<Button on:click={() => socketFriend.emit('delete_friend', { id_user_send : myProfile.id, id_user_receive : userProfile.id})}>Delete friend</Button>
					{:else}
						<Button on:click={() => socketFriend.emit('add_friend', { user_send : myProfile, user_receive : userProfile})}>Add friend</Button>
					{/if}
				{/if}
			</Card>
		</div>
	{:else} 
		<div class="container mx-auto mt-20 flex flex-wrap justify-center gap-10 max-w-screen-xl">
			{#each allUsers as user}
				{#if user.login != undefined}
					<Card padding='md' class="!bg-secondary !border-secondary">
						<div class="flex justify-end">
							<MenuButton />
							<Dropdown class="w-36">
								<DropdownItem>Block this user</DropdownItem>
							</Dropdown>
						</div>
						<div class="flex flex-col items-center pb-4 gap-2">
							<Avatar size="lg" src={user.img_link} class="object-cover" />
							<h5 class="mb-1 text-xl font-medium text-gray-900 dark:text-white">{user.login}</h5>
							<span class="text-sm text-gray-500 dark:text-gray-400 h-3">{user.kind}</span>
							<div class="flex mt-4 space-x-3 lg:mt-6">
							<Button class={buttonClass}>Add friend</Button>
							<Button class={secondaryButtonClass}>Message</Button>
							</div>
						</div>
					</Card>
				{/if}
			{/each}
		</div>
	{/if}
</div>