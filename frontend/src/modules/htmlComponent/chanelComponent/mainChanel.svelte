<script lang="ts">
    import { Modal,Avatar, Dropdown, DropdownItem, Indicator } from "flowbite-svelte";
    import { onMount } from "svelte";
    import Arrow from '../svgComponent/svgArrow.svelte';
    import axios from 'axios';
    import { getJwt } from '$lib/jwtUtils';
    import { myProfileDataStore, userProfileDataStore, usersDataStore } from "$lib/store/user";
    import { io } from 'socket.io-client';
    import Members from '../../../modules/admin.svelte';
    import { socketMpStore, socketRoomStore, socketUserStore } from "$lib/store/socket";
    import SvgMsg from "../svgComponent/svgMsg.svelte";
    import ChanModal from "./chanModal.svelte";
    import { API_URL } from "$lib/env";
    import { currentRoomStore } from "$lib/store/roomStore";
    import SvgProfile from "../svgComponent/svgProfile.svelte";
    import { goto } from "$app/navigation";
    import { GetOneUser } from "$lib/userUtils";

    let socket : any;
    // Messagerie : //
    let toShow : boolean = false;
    let rooms : any = [];
    let allUsers : any = [];
    let myProfile : any;
	let chat : boolean = false;
    let socketMp : any;
    let active : string = "";
    let socketUser : any;
    let size = "lg";

    // Modal Create : //
    let roomName = '';
    let roomDesc = '';
    let roomPass = '';
    let roomCPass = '';
    let modalCreate = false;
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
    let dropdownAdminOpen = false;
    // CurrentRoom //
    let currentRoom : any;
    let usersCurrentRoom : any [];
    let modalUsersRoom : boolean = false;
    let usersInModalRoom : any;

    currentRoomStore.subscribe((val) => currentRoom = val);
    usersDataStore.subscribe((val) => allUsers = val);
    myProfileDataStore.subscribe((val) => myProfile = val);
    socketMpStore.subscribe(val => socketMp = val);
    socketUserStore.subscribe(val => socketUser = val);

    onMount(async () => {
        if (getJwt() != undefined && getJwt() != "") {
            try {
                await axios.get(`${API_URL}/Chat/getRooms`, {
                    headers: {
                        Authorization: `Bearer ${getJwt()}`
                    }
                }).then((res : any) => {      
                    rooms = res.data;
                    console.log('rooms ->', rooms);
                });
            } catch (error) {
                console.log(error);
            }
            // console.log(getJwt());
            socket = io(`${API_URL}`, {
                path : '/chat',
                query : {
                    token : getJwt(),
                }
            });

            socket.on("successCreate", () => {
                    close();
            })

            socket.on('rooms', (receivedRoom : any) => {
                rooms = [...rooms, receivedRoom];
            });

            socket.on('updateRoom', (receivedRoom : any) => {
                rooms = rooms.map((room : any) => {
                    if (room.name === receivedRoom.name) {
                        room = receivedRoom;
                    }
                    return room;
                });
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
                if (chat && currentRoom && currentRoom.name == receivedRoom) {
                    currentRoom = null;
                }
                rooms = rooms.filter((room : any) => room.name !== receivedRoom);
            });

            socket.on('newRight', (data : any) => {
                rooms = rooms.map((room : any) => {
                    if (room.name === data.roomName) {
                        room.admin = data.admin;
                    }
                    return room;
                });
            })
            socketRoomStore.set(socket);
        }
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
        status = 'Public';
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
        if (room && room.name) {
            socket.emit('leaveRoom', {
			    roomName : room.name,
		    });
        }
        dropdownAdminOpen = false;
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

    async function handleUserInModalRoom(room : any) {
        await axios.get(`${API_URL}/Chat/AllUsers/${room.name}`, {
            headers: {
                Authorization: `Bearer ${getJwt()}`
            }
        })
        .then((res) => {
            usersInModalRoom = res.data;
            modalUsersRoom = true;
        })
    }

</script>
<div class="div-chan flex items-end">
    {#if currentRoom}
        <ChanModal myProfile={myProfile} usersRoom={usersCurrentRoom} />
    {/if}
    <div class="content-chan {active}">
        <div class="header">
            <button on:click={() => toShow = false} class={(!toShow)? "active" : ""}>
                Channels
            </button>
            <button on:click={() => toShow = true} class={(toShow)? "active" : ""}>
                Friends
            </button>
            <button on:click={() => active = ""}>
                <Arrow />
            </button>
        </div>
        {#if !toShow}
            <div class="body-room">
                <div class="flex flex-col gap-4">
                    {#each rooms as room}
                        <div class="container-room">
                            <button on:click={() => {updateCurrentRoom(room); chat = true;}}>
                                {room.name.length > 10 ? room.name.substring(0, 10) + "..." : room.name}
                            </button>
                            <div>
                                <button class="button-open-dropdown">...</button>
                                <Dropdown class="bg-primary" open={dropdownAdminOpen}>
                                    {#if room.admin === true}
                                        <DropdownItem defaultClass="button-rooms">
                                            <button class="bg-primary border-none rounded-none p-2 font-sm hover:bg-secondary text-sm w-full text-left" on:click={() => {admin = room.name; modalAdmin = true; dropdownAdminOpen = false;}}>
                                                Admin panel
                                            </button>
                                        </DropdownItem>
                                    {/if}
                                    <DropdownItem  defaultClass="button-rooms">
                                        <button class="bg-primary border-none rounded-none p-2 font-sm hover:bg-secondary text-sm w-full text-left" on:click={() => {dropdownAdminOpen = false; handleUserInModalRoom(room);}}>
                                            Users in room
                                        </button>
                                    </DropdownItem>
                                    <DropdownItem  defaultClass="button-rooms">
                                        <button class="bg-primary border-none rounded-none p-2 font-sm hover:bg-secondary text-sm w-full text-left" on:click={() => {leaveRoom(room);}}>
                                            Leave room
                                        </button>
                                    </DropdownItem>
                                </Dropdown>
                            </div>
                        </div>
                    {/each}
                </div>
            </div>
            <div class="container-action">
                <button class="button-actions" on:click={() => openCreate()}>
                    Create
                </button>
                <button class="button-actions" on:click={() => openJoin()}>
                    Join
                </button>
            </div>
        {:else}
            <div class="body-friend">
                {#each allUsers as user}
                    {#if myProfile.friend_id && myProfile.friend_id.includes(user.id)}
                        <div class="user-friend">
                            <Avatar size="xs" src={user.img_link} rounded class="object-cover"/>
                            {#if user.activity === 0}
                                <Indicator size="xs" color="red"/>
                            {:else if user.activity === 1}
                                <Indicator size="xs" color="green"/>
                            {:else if user.activity === 2}
                                <Indicator size="xs" color="blue"/>
                            {/if}
                            <p>{user.login}</p>
                            <button class="button-svg" on:click={() => socketMp.emit("create-room", {user_send : myProfile, user_receive : user})}>
                                <SvgMsg />
                            </button>
                            <button on:click={() => {socketUser.emit("notification_game", {user_send : myProfile, user_receive : user}); goto(`/game?id_send=${myProfile.id}&id_receive=${user.id}`)}}>
                                <img src="./game-battle.png" alt="" style="max-width: none;">
                            </button>
                            <button class="button-svg" on:click={() => handleGotoUser(user.id)}>
                                <SvgProfile />
                            </button>
                        </div>
                    {/if}
                {/each}
            </div>
        {/if}
    </div>
    <button class="button-messagerie {active}" on:click={() => active = "active"}>
        Social
    </button>
</div>
    

<Modal bind:open={modalCreate} title="Create a room" color="third" class="bg-primary modal-chan">
    <div class="flex flex-col justify-between">
        <label for="room-name">Room name</label>
        <input class="focus:outline-none focus:ring-0" type="text" bind:value={roomName} id="room-name">
        {#if err.name !== ''}
            <p class="text-red-500 text-xs">{err.name}</p>
        {/if}
    </div>

    <div class="flex flex-col justify-between">
        <label for="room-desc">Room description <span class="option">(option)</span></label>
        <input class="focus:outline-none focus:ring-0" type="text" bind:value={roomDesc} id="room-desc">
    </div>

    <div class="flex flex-col justify-between">

        <select class="focus:outline-none focus:ring-0" name="room-status" id="room-status" bind:value={status}>
            <option value="Public" selected>Public</option>
            <option value="Private">Private</option>
            <option value="Protected">Protected</option>
        </select>
        {#if err.status !== ''}
            <p class="text-red-500 text-xs">{err.status}</p>
        {/if}
        {#if status === "Protected"}
            <div class="flex flex-col justify-between mt-6">
                <label for="room-pass">Password</label>
                <input class="focus:outline-none focus:ring-0" type="password" bind:value={roomPass} id="room-pass">
                {#if err.pass !== ''}
                    <p class="text-red-500 text-xs">{err.pass}</p>
                {/if}
                <label for="room-cpass">Confirm password</label>
                <input class="focus:outline-none focus:ring-0" type="password" bind:value={roomCPass} id="room-cpass">
                {#if err.cpass !== ''}
                    <p class="text-red-500 text-xs">{err.cpass}</p>
                {/if}
            </div>
        {/if}
    </div>

    <div class="flex justify-between">
        <button on:click={() => close()} class="button-actions">Close</button>
        <button on:click={() => createRoom()} class="button-actions">Create</button>
    </div>
</Modal>

<Modal bind:open={modalJoin} title="Join a room" class="bg-primary modal-chan">
    <div class="flex flex-col justify-between">
        <label for="join-name">Room name</label>
        <input class="focus:outline-none focus:ring-0" type="text" bind:value={JoinName} id="join-name">
        {#if err.already !== ''}
            <p class="text-red-500 text-xs">{err.already}</p>
        {:else if err.name !== ''}
            <p class="text-red-500 text-xs">{err.name}</p>
        {/if}
    </div>
    {#if needPass === "yes"}
        <div class="flex flex-col justify-between mt-6">
            <label for="join-pass">Password</label>
            <input class="focus:outline-none focus:ring-0" type="password" bind:value={JoinPass} id="join-pass">
            {#if err.pass !== ''}
                <p class="text-red-500 text-xs">{err.pass}</p>
            {/if}
        </div>
    {/if}
    <div class="flex justify-between">
        <button class="button-actions" on:click={() => close()}>Close</button>
        <button class="button-actions" on:click={() => joinRoom()}>Join</button>
    </div>
</Modal>

<Modal bind:open={modalUsersRoom} title="Users in room" class="bg-primary modal-user-room">
    <div class="container-user">
        {#each usersInModalRoom as user}
            <div class="content-user">
                {#if myProfile.id != user.id}
                    <button class="button-card-user">...</button>
                    <Dropdown class="w-36 !hover:bg-primary">
                        {#if myProfile.block_id && myProfile.block_id.includes(user.id)}
                            <DropdownItem on:click={() => socketUser.emit("unblock_user", { id_user_send : myProfile.id, id_user_receive : user.id })} class="!bg-primary rounded !hover:bg-primary hover:text-third transition-colors duration-300">Unblock user</DropdownItem>
                        {:else}
                            <DropdownItem on:click={() => socketUser.emit("block_user", { id_user_send : myProfile.id, id_user_receive : user.id })} class="!bg-primary rounded !hover:bg-primary hover:text-third transition-colors duration-300">Block user</DropdownItem>
                        {/if}
                    </Dropdown>
                {:else}
                    <div style="width: 14.7px;"></div>
                {/if}
                <Avatar size="md" src={user.img_link} rounded class="object-cover"/>
                {#if user.activity === 0}
                    <Indicator size="xs" color="red"/>
                {:else if user.activity === 1}
                    <Indicator size="xs" color="green"/>
                {:else if user.activity === 2}
                    <Indicator size="xs" color="blue"/>
                {/if}
                <p>{user.login}</p>
                {#if myProfile.id != user.id}
                    <button on:click={() => {socketUser.emit("notification_game", {user_send : myProfile, user_receive : user}); goto(`/game?id_send=${myProfile.id}&id_receive=${user.id}`); modalUsersRoom = false;}}>
                        <img src="./game-battle.png" alt="" style="max-width: none;">
                    </button>
                    <button class="button-svg" on:click={() => {handleGotoUser(user.id); modalUsersRoom = false;}}>
                        <SvgProfile />
                    </button>
                {:else}
                    <div class="button-svg">
                        <svg  style="width: 24px; height: 24px; margin: 0 5px;"/>
                    </div>
                    <button class="button-svg" on:click={() => {goto("/profile"); modalUsersRoom = false;}}>
                        <SvgProfile />
                    </button>
                {/if}
            </div>
        {/each}
    </div>
</Modal>

<Modal bind:open={modalAdmin} title='{admin} Admin gestion panel' size={size} class="bg-primary" >
    <Members room={admin} socket={socket} infoChannel={rooms} bind:modalAdmin={modalAdmin}/>
        <div class="flex justify-center gap-8">
            <button class="button-actions" on:click={() => close()}>Close</button>
        </div>
</Modal>
