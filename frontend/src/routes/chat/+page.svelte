<script lang="ts">

	import { onMount } from 'svelte';
	import { io } from 'socket.io-client';
	import { AuthGuard } from "$lib/AuthGuard";
    import { goto } from "$app/navigation";
    import { getJwt, removeJwt } from "$lib/jwtUtils";
	import { ButtonGroup, Button, Select, FloatingLabelInput, Drawer, Heading, Hr, Listgroup, ListgroupItem } from 'flowbite-svelte';
	import { Modal } from 'flowbite-svelte'
	import axios from 'axios';
	import Chat from '../../modules/chat.svelte';

	let isLogged = false;
	let socket : any;
	let modalCreate = false;
	let modalJoin = false;
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
		socket = io('http://localhost:4000', {
			path: "/chat",
				query: {
					token: token,
				}
		});
		try {
			await axios.get('http://localhost:4000/Chat/getRooms', {
				headers: {
					Authorization: `Bearer ${token}`
				}
			}).then((res : any) => {
				rooms = res.data;
			});
		} catch (error) {
			console.log(error);
		}
		

		socket.on('rooms', (receivedRoom : string) => {
			rooms.push(receivedRoom);
			// console.log(rooms);
		});

		socket.on('deletedRoom', (receivedRoom : string) => {
			rooms = rooms.filter((room : string) => room !== receivedRoom);
			// console.log(rooms);
		});

		socket.on('errors', (receivedErr : any) => {
			err = {...err, ...receivedErr};
			// console.log(err);
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
</script>	

<div>

	<ButtonGroup>
		<Button shadow="green" color="green" on:click={() => {color="green"; modalCreate = true}} >Create Room</Button>
		<Button shadow="green" color="green" on:click={() => {color="green"; modalJoin = true}} >Join Room</Button>
		<Button outline color="dark" on:click={() => chatList = false}>Channels list</Button>
	</ButtonGroup>

	<Drawer bind:hidden={chatList} transitionType="fly">
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
					<ListgroupItem on:click={() => openChat(room)}>{room}</ListgroupItem>
					<Button outline color="red" on:click={leaveRoom(room)}>
						<img src="/delete.svg" class="w-6 h-6" alt="delete"/>
					</Button>
				</div>
			{/each}
			</Listgroup>
		{/if}
	</Drawer>

	{#if modalChat === true}
		<Chat bind:socket={socket} bind:channel={toOpen} bind:modalChat={modalChat}/>
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