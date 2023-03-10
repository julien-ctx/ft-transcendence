<script lang="ts">
    import { Button, Modal, FloatingLabelInput, Select, Avatar, Dropdown, DropdownItem } from "flowbite-svelte";
    import { onMount } from "svelte";
    import Arrow from '../svgComponent/svgArrow.svelte';
    import axios from 'axios';
    import { getJwt } from '$lib/jwtUtils';
    import { myProfileDataStore, userProfileDataStore, usersDataStore } from "$lib/store/user";
    import { io } from 'socket.io-client';
    import Members from '../../../modules/admin.svelte';
    import SvgEdit from "../svgComponent/svgEdit.svelte";
    import SvgTrash from "../svgComponent/svgTrash.svelte";
    import SvgClose from "../svgComponent/svgClose.svelte";
    import { socketMpStore } from "$lib/store/socket";
    import SvgMsg from "../svgComponent/svgMsg.svelte";
    import MpModal from "../mpComponent/mpModal.svelte";
    import ChanModal from "./chanModal.svelte";
    import { API_URL } from "$lib/env";
    import { currentRoomStore } from "$lib/store/roomStore";
    import SvgProfile from "../svgComponent/svgProfile.svelte";
    import { goto } from "$app/navigation";
    import { GetOneUser } from "$lib/userUtils";

    let socket : any;
    // Messagerie : //
    let show : boolean = false;
    let toShow : boolean = false;
    let rooms : any = [];
    let allUsers : any = [];
    let myProfile : any;
	let openedRoom : any = '';
	let chat : boolean = false;
    let socketMp : any;
    let active : string = "";

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

    // CurrentRoom //
    let currentRoom : any;
    let usersCurrentRoom : any [];

    currentRoomStore.subscribe((val) => currentRoom = val);
    usersDataStore.subscribe((val) => allUsers = val);
    myProfileDataStore.subscribe((val) => myProfile = val);
    socketMpStore.subscribe(val => socketMp = val);

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

    async function updateCurrentRoom(room : any) {
		await axios.get(`${API_URL}/Chat/AllUsers/${room.name}`, {
			headers: {
				Authorization : `Bearer ${getJwt()}`
			}
		})
		.then((res) => {
			usersCurrentRoom = res.data            
		})

		await axios.get(`${API_URL}/Chat/getRoom/${room.name}`, {
			headers: {
				Authorization : `Bearer ${getJwt()}`
			}
		})
		.then((res) => {
            currentRoomStore.set(res.data);
		})                
    }

    async function handleGotoUser(id : string) {
        await GetOneUser(id)
        .then((res) => {
            userProfileDataStore.set(res.data);
        })
        goto(`/user?id=${id}`);
    }

</script>
<div class="div-chan flex items-end">
    {#if currentRoom}
        <ChanModal myProfile={myProfile} socketRoom={socket} usersRoom={usersCurrentRoom} />
    {/if}
    <div class="content-chan {active}">
        <div class="header">
            <button on:click={() => toShow = false}>
                Channels
            </button>
            <button on:click={() => toShow = true}>
                Friends
            </button>
            <button on:click={() => active = ""}>
                <Arrow />
            </button>
        </div>
        <div class="body">
            {#if toShow === false}
                <div class="flex flex-col gap-4">
                    {#each rooms as room}
                        <div class="container-room">
                            <button on:click={() => {updateCurrentRoom(room); chat = true;}}>
                                {room.name.length > 10 ? room.name.substring(0, 10) + "..." : room.name}
                            </button>
                            <div>
                                <button class="button-open-dropdown">...</button>
                                <Dropdown class="bg-primary">
                                    {#if room.admin === true}
                                        <DropdownItem defaultClass="button-rooms">
                                            <button on:click={() => {admin = room.name; modalAdmin = true}}>
                                                Admin panel
                                            </button>
                                        </DropdownItem>
                                    {/if}
                                    <DropdownItem  defaultClass="button-rooms">
                                        <button class="rounded justify-center" on:click={() => leaveRoom(room)}>
                                            Put in trash
                                        </button>
                                    </DropdownItem>
                                </Dropdown>
                            </div>
                        </div>
                    {/each}
                </div>
            {:else}
                {#each allUsers as user}
                    {#if myProfile.friend_id && myProfile.friend_id.includes(user.id)}
                    <div class="grid grid-cols-3">
                        <Avatar src={user.img_link} rounded class="object-cover"/>
                        <p>{user.login}</p>
                        <div class="grid grid-cols-2">
                            <button on:click={() => {socketMp.emit("create-room", {user_send : myProfile, user_receive : user})}}>
                                <SvgMsg />
                            </button>
                            <button on:click={() => {handleGotoUser(user.id)}}>
                                <SvgProfile />
                            </button>
                            <button>
                                <img src="./game-battle.png" alt="">
                            </button>
                        </div>
                    </div>

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
    <button class="button-messagerie {active}" on:click={() => active = "active"}>
        Messagerie
    </button>
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