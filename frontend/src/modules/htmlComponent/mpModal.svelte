<script lang="ts">
    import { API_URL } from "$lib/env";
    import { getJwt } from "$lib/jwtUtils";
    import { socketMpStore } from "$lib/store/socket";
    import { myProfileDataStore, myRoomMpStore, usersDataStore } from "$lib/store/user";
    import { Avatar } from "flowbite-svelte";
    import { io } from "socket.io-client";
    import { onMount } from "svelte";
    import BodyMp from "./bodyMp.svelte";
    import SvgCancel from "./svgCancel.svelte";

	let myProfile : any;
	let allUsers : any;
	let myRoomMp : any;
	let socketMp : any;
	let inputMp : any;
	let divBody : any;

	myRoomMpStore.subscribe(val => myRoomMp = val);
	myProfileDataStore.subscribe(val => myProfile = val);
	usersDataStore.subscribe(val => allUsers = val);
	socketMpStore.subscribe(val => socketMp = val);
	myRoomMpStore.subscribe(val => myRoomMp = val);

	onMount(() => {
		let socketMp = io(API_URL, {
			query : {
				token : getJwt()
			},
			path : "/private-message"
		});

		socketMp.on("update-user", (data : any) => {
			myProfileDataStore.set(data);
		})
		socketMp.on("update-room", (data : any) => {
			console.log(data);
			
			if (myRoomMp && myRoomMp.length != 0) {
				let arrId : number [] = [];
				for (let i = 0; i < myRoomMp.length; i++) {
					if (myRoomMp[i].id == data.id) {
						myRoomMp[i] = data;
						myRoomMpStore.set(myRoomMp)
						arrId.push(data.id);
					}
				}
				if (arrId && !arrId.includes(data.id)) {
					myRoomMp.push(data)
					myRoomMpStore.set(myRoomMp);
				}
			}
		})
		socketMpStore.set(socketMp);
	})



	function closeMp(room : any) {
		socketMp.emit("close-room", {id_user : myProfile.id, id_room : room.id})
	}

	function changeInput(e : any, room : any) {
		if (e.key === "Enter")
			submitMp(room);
			
	}

	function submitMp(room : any) {
		if (inputMp != "") {
			for (let i = 0; i < room.user.length; i++) {
				if (room.user[i].id != myProfile.id) {
					socketMp.emit("send-mp", {id_user_send : myProfile.id, id_user_receive : room.user[i].id ,id_room : room.id, content : inputMp})
				}
			}
			inputMp = "";
		}
	}
</script>

{#each myRoomMp as room}
	{#if room.open_id && room.open_id.includes(myProfile.id)}
		<div class="absolute bottom-0 right-10 mp-modal">
			<div class="flex p-3 items-center gap-10 header">
				{#each room.user as user}
					{#if user.id != myProfile.id}
					<Avatar src={user.img_link} rounded class="object-cover"/>
					<p>Conversation with {user.login}</p>
					{/if}
				{/each}
				<button on:click={() => closeMp(room)}>
					<SvgCancel />
				</button>
			</div>
			<BodyMp room={room} />
			<div class="send">
				<input type="text" bind:value={inputMp} on:keydown={(e) => changeInput(e, room)} />
				<button on:click={() => submitMp(room)}>Send</button>
			</div>
		</div>
	{/if}
{/each}
