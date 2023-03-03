<script lang="ts">
	import { Avatar, Button, Dropdown, DropdownItem, MenuButton, Search, Indicator, Table, TableBody, TableHead, TableHeadCell, TableBodyCell, TableBodyRow, TableSearch } from "flowbite-svelte";
    import { myProfileDataStore } from '$lib/store/user';
    import { socketFriendStore, socketUserStore } from '$lib/store/socket';
    import { buttonClass, secondaryButtonClass, inputClass } from '$lib/classComponent';
    import { onMount } from "svelte";
    import { GetAllUsers } from "$lib/userUtils";

	let socketFriend : any;
	let socketUser : any;
	let myProfile : any;
	let allUsers : any = [];

	myProfileDataStore.subscribe(val => myProfile = val)
	socketFriendStore.subscribe(val => socketFriend = val);
	socketUserStore.subscribe(val => socketUser = val);

	onMount(async () => {
		await GetAllUsers()
		.then((res) => {
			allUsers = res.data;
		})

	})

	function handleClickAcceptFriend(user : any) {
		let notif : any;
		myProfile.notification.forEach((elem : any) => {
			if (elem.type == 0 && elem.id_user_send == user.id)
				notif = elem;
		});
		socketFriend.emit("accept_friend", { user : myProfile, notif});
	}

	let searchTerm = '';
	$: filteredItems = allUsers.filter(
		(item : any) => item.login.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1
	);

</script>

<div class="p-10">
	<div class="container mx-auto gap-10 max-w-screen-xl">
		<TableSearch placeholder="Search by nickname" bind:inputValue={searchTerm} striped={true} color="blue">
			<TableHead>
				<TableHeadCell></TableHeadCell>
				<TableHeadCell>Nickname</TableHeadCell>
				<TableHeadCell>Activity</TableHeadCell>
				<TableHeadCell>Win rate</TableHeadCell>
				<TableHeadCell>Ranking</TableHeadCell>
				<TableHeadCell>Actions</TableHeadCell>
			</TableHead>
			<TableBody>
				{#each filteredItems as user}
					{#if user.login != undefined}
						<TableBodyRow>
							<TableBodyCell>
								<MenuButton />
								<Dropdown class="w-36">
									{#if myProfile.block_id && myProfile.block_id.includes(user.id)}
										<DropdownItem on:click={() => socketUser.emit("unblock_user", { id_user_send : myProfile.id, id_user_receive : user.id})}>Unblock this user</DropdownItem>
									{:else}
										<DropdownItem on:click={() => socketUser.emit("block_user", { id_user_receive : user.id, id_user_send : myProfile.id})}>Block this user</DropdownItem>
									{/if}
								</Dropdown>
								<Avatar size="lg" src={user.img_link} class="object-cover" rounded/>
							</TableBodyCell>
							<TableBodyCell>
								{user.login}
							</TableBodyCell>
							<TableBodyCell>
								<div class="flex gap-2 items-center">
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
							</TableBodyCell>
							<TableBodyCell>
								100%
							</TableBodyCell>
							<TableBodyCell>
								Silver
							</TableBodyCell>
							<TableBodyCell>
								<div class="flex space-x-3">
									{#if myProfile.block_id && myProfile.block_id.includes(user.id)}
										<Button on:click={() => socketUser.emit("unblock_user", { id_user_send : myProfile.id, id_user_receive : user.id})}>Unblock this user</Button>
									{:else}
										{#if user.block_id && user.block_id.includes(myProfile.id)}
											<div>This user blocked you</div>
										{:else}
											{#if myProfile.req_send_friend && myProfile.req_send_friend.includes(user.id)}
												<div>Pending request friend</div>
												<Button class={buttonClass} on:click={() => socketFriend.emit("cancel_friend", {id_user_send : myProfile.id, id_user_receive : user.id})}>
													<svg width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 20V19C4 16.2386 6.23858 14 9 14H12.75M16 15L18.5 17.5M18.5 17.5L21 20M18.5 17.5L21 15M18.5 17.5L16 20M15 7C15 9.20914 13.2091 11 11 11C8.79086 11 7 9.20914 7 7C7 4.79086 8.79086 3 11 3C13.2091 3 15 4.79086 15 7Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
												</Button>
											{:else if myProfile.req_received_friend && myProfile.req_received_friend.includes(user.id)}
												<Button on:click={() => handleClickAcceptFriend(user)}>
													<svg width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 20V19C4 16.2386 6.23858 14 9 14H12.75M17.5355 13.9645V17.5M17.5355 17.5V21.0355M17.5355 17.5H21.0711M17.5355 17.5H14M15 7C15 9.20914 13.2091 11 11 11C8.79086 11 7 9.20914 7 7C7 4.79086 8.79086 3 11 3C13.2091 3 15 4.79086 15 7Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
												</Button>
											{:else if myProfile.friend_id && myProfile.friend_id.includes(user.id)}
												<Button class={buttonClass} on:click={() => socketFriend.emit('delete_friend', { id_user_send : myProfile.id, id_user_receive : user.id})}>
													<svg width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 20V19C4 16.2386 6.23858 14 9 14H12.75M16 15L18.5 17.5M18.5 17.5L21 20M18.5 17.5L21 15M18.5 17.5L16 20M15 7C15 9.20914 13.2091 11 11 11C8.79086 11 7 9.20914 7 7C7 4.79086 8.79086 3 11 3C13.2091 3 15 4.79086 15 7Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
												</Button>
											{:else}
												<Button class={buttonClass} on:click={() => socketFriend.emit('add_friend', { user_send : myProfile, user_receive : user})}>
													<svg width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 20V19C4 16.2386 6.23858 14 9 14H12.75M17.5355 13.9645V17.5M17.5355 17.5V21.0355M17.5355 17.5H21.0711M17.5355 17.5H14M15 7C15 9.20914 13.2091 11 11 11C8.79086 11 7 9.20914 7 7C7 4.79086 8.79086 3 11 3C13.2091 3 15 4.79086 15 7Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
												</Button>
											{/if}
											<Button class={secondaryButtonClass}>
												<svg width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20.33 3.66996C20.1408 3.48213 19.9035 3.35008 19.6442 3.28833C19.3849 3.22659 19.1135 3.23753 18.86 3.31996L4.23 8.19996C3.95867 8.28593 3.71891 8.45039 3.54099 8.67255C3.36307 8.89471 3.25498 9.16462 3.23037 9.44818C3.20576 9.73174 3.26573 10.0162 3.40271 10.2657C3.5397 10.5152 3.74754 10.7185 4 10.85L10.07 13.85L13.07 19.94C13.1906 20.1783 13.3751 20.3785 13.6029 20.518C13.8307 20.6575 14.0929 20.7309 14.36 20.73H14.46C14.7461 20.7089 15.0192 20.6023 15.2439 20.4239C15.4686 20.2456 15.6345 20.0038 15.72 19.73L20.67 5.13996C20.7584 4.88789 20.7734 4.6159 20.7132 4.35565C20.653 4.09541 20.5201 3.85762 20.33 3.66996ZM4.85 9.57996L17.62 5.31996L10.53 12.41L4.85 9.57996ZM14.43 19.15L11.59 13.47L18.68 6.37996L14.43 19.15Z" fill="#000000"/></svg>
											</Button>
										{/if}
									{/if}
									<Button href="/user?id={user.id}">
										<svg width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M16.5 7.063C16.5 10.258 14.57 13 12 13c-2.572 0-4.5-2.742-4.5-5.938C7.5 3.868 9.16 2 12 2s4.5 1.867 4.5 5.063zM4.102 20.142C4.487 20.6 6.145 22 12 22c5.855 0 7.512-1.4 7.898-1.857a.416.416 0 0 0 .09-.317C19.9 18.944 19.106 15 12 15s-7.9 3.944-7.989 4.826a.416.416 0 0 0 .091.317z" fill="#000000"/></svg>
									</Button>
								</div>
							</TableBodyCell>
						</TableBodyRow>
			  		{/if}
			  {/each}
			</TableBody>
		  </TableSearch>
	</div>
</div>