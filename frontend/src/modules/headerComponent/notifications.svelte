<script lang="ts">
    import { Avatar, Button, Dropdown, DropdownDivider, Card } from "flowbite-svelte";
    import { myNotifLength, myProfileDataStore } from '$lib/store/user';
    import { socketFriendStore, socketUserStore } from "$lib/store/socket";
    import { GetAllUsers } from "$lib/userUtils";

	let socketFriend : any;
	let socketUser : any;
	let myProfile : any;
	let countNotif : any;

	myProfileDataStore.subscribe(val => myProfile = val);
	myNotifLength.subscribe(val => countNotif = val);
	socketFriendStore.subscribe(val => socketFriend = val);
	socketUserStore.subscribe(val => socketUser = val);

	async function blockUser(notif : any) {
		await GetAllUsers()
		.then((res) => {
			const users = res.data;
			users.forEach((elem : any) => {
				if (elem.id == notif.id_user_send) {
					socketUser.emit("block_user", {id_user_receive : myProfile.id, id_user_send : elem.id})
				}
			});
		})
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
						<Button on:click={() => socketFriend.emit("accept_friend", { user : myProfile, notif})}>Accepter</Button>
						<Button on:click={() => socketFriend.emit("refuse_friend", {user : myProfile, notif})}>Refuser</Button>
						<Button on:click={() => blockUser(notif)}>Blocker</Button>
					{/if}
				</Card>
				<DropdownDivider/>
			{/each}
		</Dropdown>
	{/if}
</div>
