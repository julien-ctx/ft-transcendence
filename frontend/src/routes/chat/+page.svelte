<script lang="ts">

	import { onMount } from 'svelte';
	import { io } from 'socket.io-client';
	import { AuthGuard } from "$lib/store/AuthGuard";
    import { goto } from "$app/navigation";
    import { getJwt, removeJwt } from "$lib/jwtUtils";
	import { Dropdown, DropdownItem, Chevron, Badge, Table, TableHead, TableHeadCell, TableBodyCell, ButtonGroup, Button, Select, FloatingLabelInput, Drawer, Heading, Hr, Listgroup, ListgroupItem, TableBody, TableBodyRow, MenuButton } from 'flowbite-svelte';
	import { Modal } from 'flowbite-svelte'
	import axios from 'axios';
	import Chat from '../../modules/chat.svelte';
	import Edit from '../../modules/roomEdit.svelte';
	// import { socketRoomStore } from '$lib/store/socket';
	import Admin  from '../../modules/admin.svelte';
    import { API_URL } from '$lib/env';

	let isLogged = false;
	let socket : any;
	let modalCreate = false;
	let modalJoin = false;
	let modalAdmin = false;
	let status : string = '';
	let needPass : string = '';
	let states = [
		{value:"Protected", name: "Protected"},
		{value:"Private", name: "Private"},
		{value:"Public", name: "Public"},
		]
	let color : string = '';
	let err : any = {name : "", desc : "", status : "", pass : "", cpass : "", already : ""};
	let rooms : any = [];
	let allRooms : any = [];
	// socketRoomStore.subscribe(val => socket = val);
	onMount(async () => {
		AuthGuard()
		.then((res) => {
			isLogged = true;
		})
		.catch((err) => {
			removeJwt();
			goto("/login")
		})


		let token : string = getJwt();

		socket = io(API_URL, {
			path : '/chat',
			query : {
				token : token,
			}
		});

		try {
			await axios.get(`${API_URL}/Chat/getRooms`, {
				headers: {
					Authorization: `Bearer ${token}`
				}
			}).then((res : any) => {
				rooms = res.data;
			});
		} catch (error) {
			console.log(error);
		}
		try {
			await axios.get(`${API_URL}/Chat/getAll`, {
				headers : {
					Authorization: `Bearer ${token}`
				}
			})
		.then((res : any) => {
			allRooms = res.data;
		})
		} catch (error) {
			console.log(error);
		}
		

		socket.on('rooms', (receivedRoom : string) => {
			rooms.push(receivedRoom);
		});

		socket.on('deletedRoom', (receivedRoom : string) => {
			rooms = rooms.filter((room : any) => room.name !== receivedRoom);
		});

		socket.on('errors', (receivedErr : any) => {
			err = {...err, ...receivedErr};
		});

		socket.on("successCreate", () => {
			close();
		})

		socket.on("successJoin", () => {
			close();
		})

		socket.on("needPass", () => {
			needPass = 'yes';
		})
	});

	function createRoom() {
		socket.emit('createRoom', {
			roomName: roomName,
			roomDesc: roomDesc,
			roomStatus: status,
			roomPass: roomPass,
			roomPassConfirm: roomCPass
		});
	}

	function joinRoom() {
		// Do socket
		socket.emit('joinRoom', {
			roomName: JoinName,
			roomPass: JoinPass
		});
	}

	function close() {
		modalCreate = false;
		modalJoin = false;
		JoinName = '';
		JoinPass = '';
		needPass = '';
		roomName = '';
		roomDesc = '';
		roomPass = '';
		roomCPass = '';
		status = '';
		err = {name : "", desc : "", status : "", pass : "", cpass : "", already : ""};
	}

	function openChat(room : string) {
		toOpen = room;
		chatList = true;
		modalChat = true;
	}

	function leaveRoom(room : string) {
		socket.emit('leaveRoom', {
			roomName : room,
		});
	}

	function editRoom(room : string) {
		toEdit = room;
		modalEdit = true;
	}

	function admin(room : string) {
		toAdmin = room;
		modalAdmin = true;
	}

	let JoinName = '';
	let JoinPass = '';

	let roomName = '';
	let roomDesc = '';
	let roomPass = '';
	let roomCPass = '';

	let chatList = true;
	let activateClickOutside = false;
	let toOpen : string = '';
	let modalChat = false;
	let modalEdit = false;
	let toEdit : string = '';
	let toAdmin : string = '';
</script>	

<div>

	<ButtonGroup>
		<Button shadow="green" color="green" on:click={() => {color="green"; modalCreate = true}} >Create Room</Button>
		<Button shadow="green" color="green" on:click={() => {color="green"; modalJoin = true}} >Join Room</Button>
		<Button outline color="dark" on:click={() => chatList = false}>Channels list</Button>
	</ButtonGroup>
	<div class="flex justify-center">
		<h6 class="text-4xl">List of the channels</h6>
	</div>
	<div class="flex justify-center">
		<Table striped={true}>
			<TableHead defaultRow={false}>
				<TableHeadCell>Name</TableHeadCell>
				<TableHeadCell>Status</TableHeadCell>
				<TableHeadCell>Members</TableHeadCell>
				<TableHeadCell>Joinable</TableHeadCell>
			</TableHead>
			<TableBody>
				{#each allRooms as room}
					<TableBodyRow>
						<TableBodyCell>{room.name}</TableBodyCell>
						<TableBodyCell>
							{#if room.status === "Public"}
								<Badge color="green">Public</Badge>
							{:else if room.status === "Private"}
								<Badge color="red">Private</Badge>
							{:else}
								<Badge color="yellow">Protected</Badge>
							{/if}
						</TableBodyCell>
						<TableBodyCell>{room.members}</TableBodyCell>
						{#if room.status === "Public"}
							<TableBodyCell>
								<Button>
									<!-- <img src="/link.png" alt="join"/> -->
								</Button>
							</TableBodyCell>
						{:else}
							<TableBodyCell></TableBodyCell>
						{/if}
					</TableBodyRow>
				{/each}
			</TableBody>
		</Table>	
	</div>

	<Drawer bind:hidden={chatList} transitionType="fly" width="w-2/6">
		<div class="flex justify-center">
			<Heading tag="h2" customSize="text-4xl font-extrabold ">Channels</Heading>
		</div>
		<Hr class="my-8" height="h-px" />
		{#if rooms.length === 0}
			<p class="text-center">You are not member of any Channels</p>
		{:else}
			<Listgroup active >
			{#each rooms as room} 
				<div class="flex">
					<ListgroupItem on:click={() => openChat(room.name)}>{room.name}</ListgroupItem>
					{#if room.owner === true && room.status === "Protected"}
						<Button outline color="blue" on:click={() => editRoom(room.name)}>
							<img src="/edit.svg" class="w-6 h-6" alt="edit"/>
						</Button>
					{/if}
					<Button outline color="red" on:click={() => leaveRoom(room.name)}>
						<img src="/delete.svg" class="w-6 h-6" alt="delete"/>
					</Button>
					{#if room.admin === true}
						<MenuButton />
						<Admin bind:socket={socket} bind:room={room.name}/>
					{/if}
				</div>
			{/each}
			</Listgroup>
		{/if}
	</Drawer>

	{#if modalChat === true}
		<Chat bind:socket={socket} bind:channel={toOpen} bind:modalChat={modalChat}/>
	{/if}

	{#if modalEdit === true}
		<Edit bind:socket={socket} bind:room={toEdit} bind:modalEdit={modalEdit}/>
	{/if}

	{#if modalAdmin === true}
		<Admin bind:socket={socket} bind:room={toAdmin} bind:open={modalAdmin}/>
	{/if}

	<Modal bind:open={modalCreate} title="Create a room" {color}>
		<FloatingLabelInput style="filled" id="floating_filled" name="Room Name" type="text" label="Room Name" bind:value={roomName}/>
		{#if err.name !== ''}
			<p class="text-red-500 text-xs">{err.name}</p>
		{/if}
		<FloatingLabelInput style="filled" id="floating_filled" name="Room Name" type="text" label="Description (option)" bind:value={roomDesc}/>
		<Select id="select-underline" underline class="mt-2" items={states} bind:value={status}/>
		{#if err.status !== ''}
			<p class="text-red-500 text-xs">{err.status}</p>
		{/if}
		{#if status === "Protected"}
			<FloatingLabelInput style="filled" id="floating_filled" name="Room Name" type="password" label="Password" bind:value={roomPass}/>
			{#if err.pass !== ''}
				<p class="text-red-500 text-xs">{err.pass}</p>
			{/if}
			<FloatingLabelInput style="filled" id="floating_filled" name="Room Name" type="password" label="Confirm Password" bind:value={roomCPass}/>
			{#if err.cpass !== ''}
				<p class="text-red-500 text-xs">{err.cpass}</p>
			{/if}
		{/if}
		<div class="flex justify-center gap-8">
			<Button style="" shadow="green" gradient color="green" on:click={() => createRoom()}>Create</Button>
			<Button style="" shadow="green" gradient color="green" on:click={() => close()}>Close</Button>
		</div>
	</Modal>

	<Modal bind:open={modalJoin} title="Join a room" {color}>
		<FloatingLabelInput style="filled" id="floating_filled" name="Room Name" type="text" label="Room Name" bind:value={JoinName}/>
		{#if err.already !== ''}
			<p class="text-red-500 text-xs">{err.already}</p>
		{:else if err.name !== ''}
			<!-- {#if err.name !== ''} -->
				<p class="text-red-500 text-xs">{err.name}</p>
			<!-- {/if} -->
		{/if}
		{#if needPass === "yes"}
			<FloatingLabelInput style="filled" id="floating_filled" name="Room Name" type="password" label="Password" bind:value={JoinPass}/>
			{#if err.pass !== ''}
				<p class="text-red-500 text-xs">{err.pass}</p>
			{/if}
		{/if}
		<div class="flex justify-center gap-8">
			<Button style="" shadow="green" gradient color="green" on:click={() => joinRoom()}>Join</Button>
			<Button style="" shadow="green" gradient color="green" on:click={() => close()}>Close</Button>
		</div>
	</Modal>
</div>