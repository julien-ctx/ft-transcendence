<script lang="ts">
    import { GetOneUser } from '$lib/userUtils';
	import { Avatar, Card } from "flowbite-svelte";
    import { onMount } from 'svelte';
    import { myProfileDataStore, userProfileDataStore } from '../../store';
	import io from 'socket.io-client';
    import { getJwt } from '$lib/jwtUtils';

	let isMount : boolean = false;
	let hasId : boolean = false;
	let userProfile : any;
	let socket : any;
	let myProfile : any;

	myProfileDataStore.subscribe(val => {
		myProfile = val;
	})

	userProfileDataStore.subscribe(val => {
		userProfile = val;
	})

	onMount(() => {
		const urlParams = new URLSearchParams(window.location.search);
		hasId = urlParams.has("id");
		if (hasId) {
			let id : any = urlParams.get("id");
			GetOneUser(id)
			.then((res) => {
				userProfileDataStore.set(res.data);
				isMount = true;
			});
		}
		socket = io('http://localhost:4000', {
			path: "/notifFriend",
			query : { token : getJwt()}
		});
	})

	function handleClickRequestFriend() {
		socket.emit('add_friend', { user_send : myProfile, user_receive : userProfile});
	}

	function handleClickDeleteFriend() {
		socket.emit("delete_friend", {user_send : myProfile, user_receive : userProfile});
	}
</script>

{#if isMount}
	<div class="container mx-auto flex items-center flex-col">
		<Card padding="sm" size="md">
			<div class="flex items-center space-x-4">
				<Avatar size="xl" src={userProfile.img_link} class="object-cover"/>
				<div class="space-y-1 font-medium dark:text-white">
					<div>Login: {userProfile.login}</div>
					<div>Firstname: {userProfile.first_name}</div>
					<div>Lastname: {userProfile.last_name}</div>
					<div>Email: {userProfile.email}</div>
				</div>
			</div>
			{#if myProfile.req_friend.includes(userProfile.id)}
				<div>Demande en attente</div>
			{:else if myProfile.friend_id.includes(userProfile.id)}
				<button on:click={handleClickDeleteFriend}>Delete friend</button>
			{:else}
				<button on:click={handleClickRequestFriend}>Add friend</button>
			{/if}

		</Card>
	</div>
{/if}