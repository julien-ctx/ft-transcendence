<script lang="ts">
    import { Button, Dropdown, DropdownDivider, Toast } from "flowbite-svelte";
	import io from 'socket.io-client';
	import { onMount } from 'svelte';
    import { myNotifLength, myProfileDataStore } from '../store';
    import { getJwt } from '$lib/jwtUtils';
    import { UpdateProfileToStore } from "$lib/profileUtils";

	let socket : any;
	let myProfile : any;
	let countNotif : any;

	myProfileDataStore.subscribe(val => {
		myProfile = val;
	})

	myNotifLength.subscribe(val => {
		countNotif = val;
	})

	onMount(() => {
		socket = io('http://localhost:4000', {
			path: "/notifFriend",
			query : { token : getJwt()}
		});

		socket.on('notification_friend', (data : any) => {
			UpdateProfileToStore(data);			
		});
		socket.on("event_friend", (data : any) => {		
			UpdateProfileToStore(data);
		});
	});

	function acceptReq(notif : any) {
		socket.emit("accept_friend", { user : myProfile, notif});
	}

	function refuseReq(notif : any) {
		socket.emit("refuse_friend", {user : myProfile, notif});
	}
</script>

<div class="relative">
	<p class="absolute bg-red-300 rounded-full" style="top: -10px; right: -10px; padding: 5px 10px;">{countNotif}</p>
	<Button>
		Notifications
	</Button>
	<Dropdown>
		{#each myProfile.notif_friend as  notif}
			<div>Demande d'ami de {notif.login_send}</div>
			<button on:click={() => acceptReq(notif)}>Accepter</button>
			<button on:click={() => refuseReq(notif)}>Refuser</button>
			<DropdownDivider/>
		{/each}
	</Dropdown>
</div>
