<script lang="ts">
    import { Button, Modal, FloatingLabelInput, Select } from "flowbite-svelte";
    import { onMount } from "svelte";
    import Arrow from '../svgComponent/svgArrow.svelte';
    import axios from 'axios';
    import { getJwt } from '$lib/jwtUtils';
    import { myProfileDataStore, usersDataStore } from "$lib/store/user";
    import { io } from 'socket.io-client';
    import Members from '../../../modules/admin.svelte';
    import SvgEdit from "../svgComponent/svgEdit.svelte";
    import SvgTrash from "../svgComponent/svgTrash.svelte";
    import SvgClose from "../svgComponent/svgClose.svelte";

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
        err = {name : "", desc : "", status : "", pass : "", cpass : "", already : ""};
        JoinName = '';
        JoinPass = '';
        needPass = '';
    }

	function leaveRoom(room : any) {
		socket.emit('leaveRoom', {
			roomName : room.name,
		});
	}

</script>
<div class="div-chan flex items-end">
    {#if show}
        {#if openedRoom !== ''}
            <div class="flex justify-between bg-white w-26 w-64 mr-4 rounded-xl">
                <button on:click={() => chat = true}>
                    <span>{openedRoom}</span> 
                </button>
                <button on:click={() => { openedRoom = ''}}>
                    <SvgClose />
                </button>
            </div>
        {/if}
        <div class="w-full mr-4 rounded-xl h-full border border-secondary">
            <div class="flex flex-row justify-center gap-4 text-1xl pl-4">
                <button on:click={() => toShow = false}>
                    Channels
                </button>
                <button on:click={() => toShow = true}>
                    Friends
                </button>
                <button on:click={() => show = !show}>
                    <Arrow />
                </button>
            </div>
            <br>
            <div class="overflow-auto">
                {#if toShow === false}
                    <div class="flex flex-col gap-4">
                        {#each rooms as room}
                                <div class="flex flex-row justify-between w-full bg-white rounded text-2xl pl-4 ">
                                    <button on:click={() => {openedRoom = room.name; chat = true}}>
                                        {room.name.length > 10 ? room.name.substring(0, 10) + "..." : room.name}
                                    </button>
                                    <div>
                                        {#if room.admin === true}
                                            <button on:click={() => {admin = room.name; modalAdmin = true}}>
                                                <SvgEdit />
                                            </button>
                                        {/if}
                                        <button class="rounded justify-center" on:click={() => leaveRoom(room)}>
                                            <SvgTrash />
                                        </button>
                                    </div>
                                </div>
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
            <div class="container-action">
                <button class="button-action" on:click={() => openCreate()}>
                    Create
                </button>
                <button class="button-action" on:click={() => openJoin()}>
                    Join
                </button>
            </div>
        </div>
    {:else}
        <div>
            {#if openedRoom !== ''}
                <div class="flex justify-between bg-white w-26 border">
                    <button on:click={() => chat = true}>
                        <span>{openedRoom}</span> 
                    </button>
                    <button on:click={() => { openedRoom = ''}}>
                        <SvgClose />
                    </button>
                </div>
            {/if}
            <button class="button-messagerie" on:click={() => show = true}>
                Messagerie
            </button>
        </div>
    {/if}
</div>
    

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
    <Members room={admin} socket={socket} infoChannel={rooms}/>
	<div class="flex justify-center gap-8">
		<Button style="" gradient color="third" on:click={() => close()}>Close</Button>
	</div>
</Modal>