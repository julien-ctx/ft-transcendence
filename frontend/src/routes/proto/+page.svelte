<script lang="ts">
    import { Button, Modal, FloatingLabelInput, Select } from "flowbite-svelte";
    import { onMount } from "svelte";
    import Arrow from '../../modules/htmlComponent/svgArrow.svelte';
    import axios from 'axios';
    import { getJwt } from '$lib/jwtUtils';
    import { myProfileDataStore, usersDataStore } from "$lib/store/user";
    import { io } from 'socket.io-client';
	import Channels from './roomStyle.svelte';
	import Trash from '../../modules/htmlComponent/svgComponent/svgTrash.svelte';
    import RoomEdit from "../../modules/roomEdit.svelte";
	import Close from '../../modules/htmlComponent/svgComponent/svgClose.svelte';
    import Members from '../../modules/admin.svelte';

    let socket : any;
    // Messagerie : //
    let show : boolean = false;
    let toShow : boolean = false;
    let rooms : any = [];
    let allUsers : any = [];
    let myProfile : any;
	let openedRoom : any = '';
	let chat : boolean = false;

    // Modal Create : //
    let roomName = '';
    let roomDesc = '';
    let roomPass = '';
    let roomCPass = '';
    let modalCreate = false;
    let states = [
        {value:"Protected", name: "Protected"},
        {value:"Private", name: "Private"},
        {value:"Public", name: "Public"},
        ]
    let err : any = {name : "", desc : "", status : "", pass : "", cpass : "", already : ""};   
    let status : string = '';


    // Modal Join : //
    let modalJoin = false;
    let JoinName = '';
    let JoinPass = '';
    let needPass = '';

	// Modal Admin : //
	let modalAdmin = false;
	let admin = '';

    usersDataStore.subscribe((value) => {
        allUsers = value;
    });

    myProfileDataStore.subscribe((value) => {
        myProfile = value;
    });

    onMount(async () => {
        let token : string = getJwt();
        try {
            await axios.get('http://localhost:4000/Chat/getRooms', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }).then((res : any) => {
                rooms = res.data;
                console.log(rooms);
            });
        } catch (error) {
            console.log(error);
        }
        socket = io('http://localhost:4000', {
            path : '/chat',
            query : {
                token : token,
            }
        });

        socket.on("successCreate", () => {
                close();
        })

        socket.on('rooms', (receivedRoom : string) => {
            rooms = [...rooms, receivedRoom];
        });

        socket.on('errors', (receivedErr : any) => {
            err = {...err, ...receivedErr};
        });

		socket.on("needPass", () => {
			needPass = 'yes';
		})

		socket.on("successJoin", () => {
			close();
		})

		socket.on('deletedRoom', (receivedRoom : string) => {
			rooms = rooms.filter((room : any) => room.name !== receivedRoom);
		});
    })

    function changeAppearC() {
        if (toShow === false) {
            toShow = false;
        } else {
            toShow = false;
        }
    }

    function changeAppearU() {
        if (toShow === true) {
            toShow = true;
        } else {
            toShow = true;
        }
    }

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
		socket.emit('joinRoom', {
			roomName: JoinName,
			roomPass: JoinPass
		});
	}

    function close() {
        modalCreate = false;
        modalJoin = false;
		modalAdmin = false;
		admin = '';
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

    function openCreate() {
        modalCreate = true;
        err = {name : "", desc : "", status : "", pass : "", cpass : "", already : ""};
        roomName = '';
        status = '';
        roomDesc = '';
        roomPass = '';
        roomCPass = '';
    }

    function openJoin() {
        modalJoin = true;
        JoinName = '';
        JoinPass = '';
        needPass = '';
    }

	function leaveRoom(room : string) {
		socket.emit('leaveRoom', {
			roomName : room,
		});
	}

</script>

<!-- <div class="relative h-1/2"> -->
    {#if show}
		{#if openedRoom !== ''}
			<div class="flex justify-between bg-white w-26 absolute bottom-0 right-0 w-64 mr-4 rounded-xl">
				<button on:click={() => chat = true}>
					<span>{openedRoom}</span> 
				</button>
				<button on:click={() => { openedRoom = ''}}>
					<Close  />
				</button>
			</div>
		{/if}
        <div class="absolute bottom-0 right-0 w-64 mr-4 rounded-xl h-2/3 border border-secondary">
            <div class="flex flex-row justify-center gap-4 text-2xl pl-4">
                <button on:click={() => changeAppearC()}>
                    Channels
                </button>
                <button on:click={() => changeAppearU()}>
                    Friends
                </button>
                <button on:click={() => show = !show}>
                    <Arrow />
                </button>
            </div>
            <br>
            <div class="overflow-auto h-4/5">
                {#if toShow === false}
                    <div class="flex flex-col gap-4">
                        {#each rooms as room}
							<button on:click={() => {openedRoom = room.name; chat = true}}>
								<Channels room={room} socket={socket} bind:admin={admin} bind:modalAdmin={modalAdmin}/>
							</button>
						{/each}
                    </div>
                {:else}
                    {#each allUsers as user}
                        {#if myProfile.friend_id && myProfile.friend_id.includes(user.id)}
                            {user.login}
                        {/if}
                    {/each}
                {/if}
            </div>
            <div class="flex justify-center bottom-0 absolute w-full pb-2">
                <button class="bg-primary hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-l text-xl" on:click={() => openCreate()}>
                    Create
                </button>
                <button class="bg-primary hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-r text-xl" on:click={() => openJoin()}>
                    Join
                </button>
            </div>
        </div>
    {/if}
    {#if !show}
    <div class="absolute bottom-0 right-0 flex gap-2 border rounded">
		{#if openedRoom !== ''}
			<div class="flex justify-between bg-white w-26 border">
				<button on:click={() => chat = true}>
					<span>{openedRoom}</span> 
				</button>
				<button on:click={() => { openedRoom = ''}}>
					<Close  />
				</button>
			</div>
		{/if}
        <button class="flex justify-center bg-white rounded w-24" on:click={() => show = true}>
            <span>Messagerie</span>
        </button>

    </div>
    {/if}
<!-- </div> -->

<Modal bind:open={modalCreate} title="Create a room" color="third">
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
    <div class="flex gap-8 flex-row">
        <Button style="" shadow="green" gradient color="green" on:click={() => createRoom()}>Create</Button>
        <Button style="" shadow="green" gradient color="green" on:click={() => close()}>Close</Button>
    </div>
</Modal>

<Modal bind:open={modalJoin} title="Join a room" color="third">
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

<Modal bind:open={modalAdmin} title="Admin Panel" color="third">
    <Members room={admin} socket={socket} />
	<div class="flex justify-center gap-8">
		<Button style="" gradient color="third" on:click={() => close()}>Close</Button>
	</div>
</Modal>