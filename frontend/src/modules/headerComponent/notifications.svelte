<script lang="ts">
    import { Avatar, Button, Dropdown, DropdownDivider, Card } from "flowbite-svelte";
    import { myNotifLength, myProfileDataStore } from '$lib/store/user';
    import { socketFriendStore, socketUserStore } from "$lib/store/socket";
    import { GetAllUsers } from "$lib/userUtils";
    import { inputClass, buttonClass } from '$lib/classComponent'

	let socketFriend : any;
	let socketUser : any;
	let myProfile : any;
	let countNotif : any;
	let openDropdown : boolean = false;

	myProfileDataStore.subscribe(val => myProfile = val);
	myNotifLength.subscribe(val => countNotif = val);
	socketFriendStore.subscribe(val => socketFriend = val);
	socketUserStore.subscribe(val => socketUser = val);

	async function blockUser(notif : any) {
		await GetAllUsers()
		.then((res) => {
			const users = res.data;
			if (users) {
				users.forEach((elem : any) => {
					if (elem.id == notif.id_user_send) {
						socketUser.emit("block_user", {id_user_receive : myProfile.id, id_user_send : elem.id})
					}
				});
			}
		})
	}

</script>

<div>
	{#if countNotif > 0}
		<span class="relative flex h-3 w-3 translate-x-4">
			<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-third opacity-75 right-0"></span>
			<span class="relative inline-flex rounded-full h-3 w-3 bg-third justify-self-end"></span>
		</span>
	{/if}
	<svg on:keydown={() => openDropdown = true} class="fill-secondary h-6 hover:fill-third transition-colors duration-300 cursor-pointer" viewBox="0 0 46 48" xmlns="http://www.w3.org/2000/svg">
		<path fill-rule="evenodd" clip-rule="evenodd" d="M23.0002 0C12.5068 0 4.00017 8.50659 4.00017 19V32.5335C4.00017 32.8383 3.9145 33.1371 3.75292 33.3956L0.912672 37.94C0.0801118 39.2721 1.0378 41 2.60867 41H43.3917C44.9625 41 45.9202 39.2721 45.0877 37.94L42.2474 33.3956C42.0858 33.1371 42.0002 32.8383 42.0002 32.5335V19C42.0002 8.50659 33.4936 0 23.0002 0ZM23.0002 48C20.2388 48 18.0002 45.7614 18.0002 43H28.0002C28.0002 45.7614 25.7616 48 23.0002 48Z"></path>
	</svg>
</div>
{#if myProfile.notification && myProfile.notification.length > 0}
	<Dropdown bind:open={openDropdown}>
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
