<script lang="ts">
	import { Avatar, Button, Dropdown, DropdownItem, MenuButton, Search, Indicator, Table, TableBody, TableHead, TableHeadCell, TableBodyCell, TableBodyRow, TableSearch, P } from "flowbite-svelte";
    import { myProfileDataStore, usersDataStore } from '$lib/store/user';
    import { socketFriendStore, socketUserStore } from '$lib/store/socket';
    import { buttonClass, secondaryButtonClass, inputClass } from '$lib/classComponent';
    import { onMount } from "svelte";
    import { GetAllUsers } from "$lib/userUtils";
    import { goto } from "$app/navigation";
    import SvgAdd from "../../modules/htmlComponent/svgAdd.svelte";
    import SvgDelete from "../../modules/htmlComponent/svgDelete.svelte";
    import SvgProfile from "../../modules/htmlComponent/svgProfile.svelte";
    import SvgMsg from "../../modules/htmlComponent/svgMsg.svelte";

	let socketFriend : any;
	let socketUser : any;
	let myProfile : any;
	let allUsers : any = [];
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
	});

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

<div class="p-10 container mx-auto gap-10 max-w-screen-xl">
	<Search placeholder="Search by nickname" bind:value={searchInput} on:input={handleChange}/>
	<div class="flex flex-col gap-10 mt-10">
		<div class="gap-4 grid-cols-6 text-center hidden sm:grid">
			<div>Picture</div>
			<div>Nickname</div>
			<div>Activity</div>
			<div>Win rate</div>
			<div>Ranking</div>
			<div>Actions</div>
		</div>
		{#each usersComponent as user}
			{#if user.login != undefined}
				<div class="grid grid-cols-2 gap-5 grid-flow-row sm:grid-cols-6 bg-third p-3 rounded sm:pb-3 pb-5">
					<div class="flex items-center sm:items-start justify-center sm:justify-start sm:flex-row flex-col gap-2">
						<MenuButton />
						<Dropdown class="w-36">
							{#if myProfile.block_id && myProfile.block_id.includes(user.id)}
								<DropdownItem on:click={() => socketUser.emit("unblock_user", { id_user_send : myProfile.id, id_user_receive : user.id})}>Unblock this user</DropdownItem>
							{:else}
								<DropdownItem on:click={() => socketUser.emit("block_user", { id_user_receive : user.id, id_user_send : myProfile.id})}>Block this user</DropdownItem>
							{/if}
						</Dropdown>
						<Avatar size="lg" src={user.img_link} class="object-cover" rounded/>
					</div>
					<div class="flex items-center justify-center">
						{user.login}
					</div>
					<div class="flex gap-2 items-center justify-center">
						{#if user.status == 0}
							<Indicator color="red"/> 
							<div>Offline</div>
						{:else if user.status == 1}
							<Indicator color="green"/>
							<div>Online</div>
						{:else if user.status == 2}
							<Indicator color="blue" />
							<div>In game</div>
						{/if}
					</div>
					<div class="flex items-center justify-center">
						100%
					</div>
					<div class="flex items-center justify-center">
						Silver
					</div>
					<div class="flex space-x-3 items-center justify-center">
						{#if myProfile.block_id && myProfile.block_id.includes(user.id)}
							<button on:click={() => socketUser.emit("unblock_user", { id_user_send : myProfile.id, id_user_receive : user.id})}>
								Unblock this user
							</button>
						{:else}
							{#if user.block_id && user.block_id.includes(myProfile.id)}
								<div>This user blocked you</div>
							{:else}
								{#if myProfile.req_send_friend && myProfile.req_send_friend.includes(user.id)}
									<button on:click={() => socketFriend.emit("cancel_friend", {id_user_send : myProfile.id, id_user_receive : user.id})}>
										<SvgDelete />
									</button>
								{:else if myProfile.req_received_friend && myProfile.req_received_friend.includes(user.id)}
									<button on:click={() => handleClickAcceptFriend(user)}>
										<SvgAdd/>
									</button>
								{:else if myProfile.friend_id && myProfile.friend_id.includes(user.id)}
									<button on:click={() => socketFriend.emit('delete_friend', { id_user_send : myProfile.id, id_user_receive : user.id})}>
										<SvgDelete />
									</button>
								{:else}
									<button on:click={() => socketFriend.emit('add_friend', { user_send : myProfile, user_receive : user})}>
										<SvgAdd/>
									</button>
								{/if}
								<button>
									<SvgMsg />
								</button>
							{/if}
						{/if}
						<button on:click={() => goto(`/user?id=${user.id}`)}>
							<SvgProfile />
						</button>
					</div>
				</div>
			{/if}
		{/each}
	</div>
</div>