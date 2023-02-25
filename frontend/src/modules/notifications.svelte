<script lang="ts">
    import { Button, Dropdown, DropdownDivider } from "flowbite-svelte";
	import io from 'socket.io-client';
	import { onMount } from 'svelte';
    import { myProfileDataStore } from '../store';
    import { getJwt } from '$lib/jwtUtils';

	let socket : any;
	let myProfile : any;
	let countNotif : any = 0;

	myProfileDataStore.subscribe(val => {
		myProfile = val;
		if (myProfile.notif_friend)
			countNotif = myProfile.notif_friend.length;
	})

	onMount(() => {
		socket = io('http://localhost:4000', {
			path: "/notifFriend",
			query : { token : getJwt()}
		});

		socket.on('notification_friend', (data : any) => {
			myProfileDataStore.set(data);
			if (myProfile.notif_friend)
				countNotif = myProfile.notif_friend.length;
			console.log(myProfile);
		});
	});

	function acceptReq(notif : any) {
		console.log("accept", notif);
		socket.emit("accept_friend", { user : myProfile, notif});
	}

	function refuseReq(notif : any) {
		console.log("refuse", notif);
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
