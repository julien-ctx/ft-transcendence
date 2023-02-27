<script lang="ts">
    import { GetOneUser } from '$lib/userUtils';
	import { Avatar, Card, Button } from "flowbite-svelte";
    import { onMount } from 'svelte';
    import { myProfileDataStore, userProfileDataStore } from '$lib/store/user';
	import io from 'socket.io-client';
    import { getJwt } from '$lib/jwtUtils';
    import { UpdateProfileToStore } from '$lib/profileUtils';
    import { socketFriendStore, socketUserStore } from '$lib/store/socket';

	let isMount : boolean = false;
	let hasId : boolean = false;
	let userProfile : any;
	let socketFriend : any;
	let socketUser : any;
	let myProfile : any;

	myProfileDataStore.subscribe(val => myProfile = val)
	userProfileDataStore.subscribe(val => userProfile = val);
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
				isMount = true;
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

	function blockUser () {
		socketUser.emit("block_user", { id_user_send : myProfile.id, id_user_receive : userProfile.id });
	}
</script>

{#if isMount}
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
			<Button on:click={blockUser}>Block this user</Button>
			{#if myProfile.req_send_friend && myProfile.req_send_friend.includes(userProfile.id)}
				<div>Pending request friend</div>
				<Button on:click={() => socketFriend.emit("cancel_friend", {id_user_send : myProfile.id, id_user_receive : userProfile.id})}>Cancel request</Button>
			{:else if myProfile.req_received_friend && myProfile.req_received_friend.includes(userProfile.id)}
				<Button on:click={handleClickAcceptFriend}>Accept request friend</Button>
			{:else if myProfile.friend_id && myProfile.friend_id.includes(userProfile.id)}
				<Button on:click={() => socketFriend.emit('delete_friend', { user_send : myProfile, user_receive : userProfile})}>Delete friend</Button>
			{:else}
				<Button on:click={() => socketFriend.emit('add_friend', { user_send : myProfile, user_receive : userProfile})}>Add friend</Button>
			{/if}
		</Card>
	</div>
{/if}