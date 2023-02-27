<script lang="ts">
    import { Avatar, Button, Dropdown, DropdownDivider, Card } from "flowbite-svelte";
	import io from 'socket.io-client';
	import { onMount } from 'svelte';
    import { myNotifLength, myProfileDataStore } from '$lib/store/user';
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
			path: "/notif_friend",
			query : { token : getJwt()}
		});

		socket.on('event_friend', (data : any) => {
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
	{#if countNotif > 0}
		<p class="absolute bg-red-300 rounded-full" style="top: -10px; right: -10px; padding: 5px 10px;">{countNotif}</p>	
	{/if}
	<Button>
		Notifications
	</Button>
	{#if myProfile.notification}
		<Dropdown>
			{#each myProfile.notification as notif}
				<Card horizontal size="xl">
					<Avatar src={notif.img_link} class="object-cover"/>
					{#if notif.type == 0}
						<div>Demande d'ami de {notif.login_send}</div>
						<Button on:click={() => acceptReq(notif)}>Accepter</Button>
						<Button on:click={() => refuseReq(notif)}>Refuser</Button>
					{/if}
				</Card>
				<DropdownDivider/>
			{/each}
		</Dropdown>
	{/if}
</div>
