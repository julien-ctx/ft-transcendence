<script lang="ts">
    import { goto } from "$app/navigation";
    import { API_URL } from "$lib/env";
    import { getJwt } from "$lib/jwtUtils";
    import { currentRoomStore } from "$lib/store/roomStore";
    import { socketFriendStore, socketRoomStore, socketUserStore } from "$lib/store/socket";
    import { userProfileDataStore, usersDataStore } from "$lib/store/user";
    import { GetOneUser } from "$lib/userUtils";
    import axios from "axios";
    import { Avatar, Dropdown, DropdownItem } from "flowbite-svelte";
	import { afterUpdate, onDestroy, onMount } from "svelte";
    import { element } from "svelte/internal";
    import SvgCancel from "../svgComponent/svgCancel.svelte";

	export let myProfile : any;
	export let usersRoom : any;

	let socketRoom : any;
	let currentRoom : any;
	let active : string = "";
	let divBody : any;
	let inputMp : any;
	let loginWrite : string = "";
	let Endmute : any = null;	
	let allUsers : any;
	let socketFriend : any;
	let socketUser : any;
	let dropdownOpen : boolean = false;

	currentRoomStore.subscribe((val) => currentRoom = val);
	usersDataStore.subscribe((val) => allUsers = val);
	socketFriendStore.subscribe((val) => socketFriend = val);
	socketUserStore.subscribe(val => socketUser = val);
	socketRoomStore.subscribe(val => socketRoom = val);
	onMount(async () => {
		socketRoom.on("event-write", (data : any) => {
            if (data.write) {
				for (let i = 0; i < data.write.length; i++) {
					if (data.write[i] != myProfile.login)
						loginWrite = data.write[i];
				}
			}
			else
				loginWrite = "";
        })

		socketRoom.on("update-room", (data : any) => {
			console.log(data);
			
			if (currentRoom != null)
				currentRoomStore.set(data);
		})

		socketRoom.on("muted", (data : any) => {
			Endmute = data;
			console.log('Endmute ->', Endmute);
		});
	})

	afterUpdate(async () => {
		if (divBody && divBody.scrollHeight)
			divBody.scrollTop = divBody.scrollHeight + 500;
		await axios.get(`${API_URL}/Chat/AllUsers/${currentRoom.name}`, {
			headers: {
				Authorization : `Bearer ${getJwt()}`
			}
		})
		.then((res) => {
			usersRoom = res.data            
		})
	})

	function updateActive() {
		if (active == "")
			active = "active";
		else
			active = ""
	}

	function getDate(mp : any) : string {
		const date = new Date(mp.createdAt);
		const hour = date.getHours();
		const minutes = date.getMinutes();
		return hour.toString().padStart(2, "0") + " h " + minutes.toString().padStart(2, "0");
	}

	function handleSubmit(e : any) {
		if (e.key === "Enter")
			submitMp();
	}

	function changeInput() {
		if (inputMp == "") {
			socketRoom.emit("unwrite", {user_receive : usersRoom, room : currentRoom, login : myProfile.login})
		}
		else {
			socketRoom.emit("write", {user_receive : usersRoom, room : currentRoom, login : myProfile.login});
		}
	}

	function submitMp() {
		if (inputMp != "") {
			Endmute = null;
			console.log(inputMp, currentRoom.name);
			
			socketRoom.emit('sendMessage', {
				roomName : currentRoom.name, 
				message : inputMp
			});
			inputMp = '';
			socketRoom.emit("unwrite", {user_receive : usersRoom, room : currentRoom, login : myProfile.login})
		}
	}

	function getUser(id_user : number) {
		for (let i = 0; i < usersRoom.length; i++) {
			if (usersRoom[i].id_user == id_user) {
				return usersRoom[i];
			}
		}
	}

	async function handleGotoUser(id : string) {
        await GetOneUser(id)
        .then((res) => {
            userProfileDataStore.set(res.data);
        })
        goto(`/user?id=${id}`);
    }

	function returnIdUser(id_user : any) {
		for (let i = 0; i < allUsers.length; i++) {
			if (allUsers[i].id_user == id_user)
				return allUsers[i].id;
		}
	}

	function returnIdUserFromLogin(login : string) {
		for (let i = 0; i < allUsers.length; i++) {
			if (allUsers[i].login == login)
				return allUsers[i].id;
		}
	}
</script>

{#if usersRoom && myProfile && currentRoom}
	<div class="mp-modal">
		<button class="header {active}">
			<button class="login" on:click={updateActive}>{currentRoom.name}</button>
			<button on:click={() => currentRoomStore.set(null)}>
				<SvgCancel />
			</button>
		</button>
		<div class="body {active}" bind:this={divBody}>
			{#if currentRoom.Message}
				{#each currentRoom.Message as mp, i}
					{#if getUser(mp.id_user) && getUser(mp.id_user).login && (myProfile.block_id && !myProfile.block_id.includes(returnIdUser(mp.id_user)))}
						{#if !currentRoom.Message[i - 1] || currentRoom.Message[i - 1] && currentRoom.Message[i - 1].id_user != currentRoom.Message[i].id_user}
							{#if mp.id_user != myProfile.id_user}
								<div>
									<div class="avatar">
										<Avatar src={getUser(mp.id_user).img_link} rounded class="object-cover cursor-pointer" />
										<Dropdown open={dropdownOpen} class="bg-primary rounded">
											<DropdownItem defaultClass="bg-primary border-none rounded-none p-2 font-sm hover:bg-secondary text-sm" on:click={() => {socketUser.emit("notification_game", {user_send : myProfile, user_receive : getUser(mp.id_user)}); goto(`/game?id_send=${myProfile.id}&id_receive=${getUser(mp.id_user).id}`)}}>
												Invite game
											</DropdownItem>
											<DropdownItem defaultClass="bg-primary border-none rounded-none p-2 font-sm hover:bg-secondary text-sm" on:click={() => handleGotoUser(returnIdUser(mp.id_user))}>
												Profile
											</DropdownItem>
										</Dropdown>
										<p>{getUser(mp.id_user).login}</p>
										<p style="font-size: 10px;transform: translateY(6px);">{getDate(mp)}</p>
									</div>
									<p class="msg">
										{mp.content}
									</p>
								</div>
							{:else}
								<div>
									<div class="avatar">
										<Avatar src={getUser(mp.id_user).img_link} rounded class="object-cover" />
										<p>{getUser(mp.id_user).login}</p>
										<p style="font-size: 10px;transform: translateY(6px);">{getDate(mp)}</p>
									</div>
									<p class="msg">
										{mp.content}
									</p>
								</div>
							{/if}
						{:else if (currentRoom.Message[i - 1] && currentRoom.Message[i - 1].id_user != currentRoom.Message[i].id_user) && ((currentRoom.Message[i + 1] && currentRoom.Message[i + 1].id_user != currentRoom.Message[i].id_user) || !currentRoom.Message[i + 1])}
							{#if mp.id_user != myProfile.id_user}
								<div class="solo">
									<div class="avatar">
										<Avatar src={getUser(mp.id_user).img_link} rounded class="object-cover cursor-pointer" />
										<Dropdown open={dropdownOpen}  class="bg-primary rounded">
											<DropdownItem defaultClass="bg-primary border-none rounded-none p-2 font-sm hover:bg-secondary text-sm"  on:click={() => {socketUser.emit("notification_game", {user_send : myProfile, user_receive : getUser(mp.id_user)}); goto(`/game?id_send=${myProfile.id}&id_receive=${getUser(mp.id_user).id}`)}}>
												Invite game
											</DropdownItem>
											<DropdownItem defaultClass="bg-primary border-none rounded-none p-2 font-sm hover:bg-secondary text-sm" on:click={() => handleGotoUser(returnIdUser(mp.id_user))}>
												Profile
											</DropdownItem>
										</Dropdown>
										<p>{getUser(mp.id_user).login}</p>
										<p style="font-size: 10px;transform: translateY(6px);">{getDate(mp)}</p>
									</div>
									<p class="msg end">
										{mp.content}
									</p>
								</div>
							{:else}
								<div class="solo">
									<div class="avatar">
										<Avatar src={getUser(mp.id_user).img_link} rounded class="object-cover" />
										<p>{getUser(mp.id_user).login}</p>
										<p style="font-size: 10px;transform: translateY(6px);">{getDate(mp)}</p>
									</div>
									<p class="msg end">
										{mp.content}
									</p>
								</div>
							{/if}
						{:else if currentRoom.Message[i + 1] && currentRoom.Message[i + 1].id_user == currentRoom.Message[i].id_user}
							<p class="msg">
								{mp.content}
							</p>
						{:else}
							<p class="msg end">
								{mp.content}
							</p>
						{/if}
					{/if}
				{/each}
			{/if}
			<div class="typing {(loginWrite && myProfile.block_id && !myProfile.block_id.includes(returnIdUserFromLogin(loginWrite)))? 'active' : ''}">
				<span class="login">{loginWrite}</span>
				<span>is writing</span> 
				<div class="dot-typing"></div>
			</div>
			{#if currentRoom.Message && currentRoom.Message.length == 0}
				Start a new conversation in {currentRoom.name}
			{/if}
			{#if Endmute !== null}
				<div class="text-xs">
					Your mute end the {Endmute.Years} {Endmute.Days}/{Endmute.Months} at {Endmute.Hours}:{Endmute.Minutes}:{Endmute.Seconds}
				</div>	
			{/if}
		</div>
		<div class="send {active}">
			<input placeholder="Send a message" class="send-msg focus:outline-none focus:ring-0" type="text" bind:value={inputMp} on:keypress={handleSubmit} on:input={changeInput}/>
		</div>
	</div>
{/if}
