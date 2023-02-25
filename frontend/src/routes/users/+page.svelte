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

	userProfileDataStore.subscribe(val => {
		userProfile = val;
	})	

	myProfileDataStore.subscribe(val => {
		myProfile = val;
	})

	onMount(() => {
		const urlParams = new URLSearchParams(window.location.search);
		hasId = urlParams.has("id");
		if (hasId) {
			let id : any = urlParams.get("id");
			GetOneUser(id)
			.then((res) => {
				let tmp : any;
				tmp = res.data;
				if (tmp.img_link.includes("/Users")) {
					const path = tmp.img_link.split("/");
					tmp.img_link = `/${path[path.length - 1]}`
				}
				userProfileDataStore.set(tmp);
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

</script>

{#if isMount}
	<div class="container mx-auto flex items-center flex-col">
		<Card padding="sm" size="md">
			<div class="flex items-center space-x-4">
				<Avatar size="xl" src={userProfile.img_link}/>
				<div class="space-y-1 font-medium dark:text-white">
					<div>Login: {userProfile.login}</div>
					<div>Firstname: {userProfile.first_name}</div>
					<div>Lastname: {userProfile.last_name}</div>
					<div>Email: {userProfile.email}</div>
				</div>
			</div>
			<button on:click={handleClickRequestFriend}>Add friend</button>
		</Card>
	</div>
{/if}