<script lang="ts">
    import { API_URL } from "$lib/env";
    import { getJwt } from "$lib/jwtUtils";
    import axios from "axios";
    import { Avatar } from "flowbite-svelte";
	import { afterUpdate, onMount } from "svelte";
    import SvgCancel from "../svgComponent/svgCancel.svelte";

	export let myProfile : any;
	export let room : any;
	export let socketRoom : any;
	let allUsers : any = []
	let active : string = "";
	let divBody : any;
	let currentUser : any;
	let inputMp : any;
	let loginWrite : string = "";
	onMount(async () => {
		await axios.get(`${API_URL}/Chat/Users/${room.name}`, {
			headers: {
				Authorization : `Bearer ${getJwt()}`
			}
		})
		.then((res) => {
			allUsers = res.data
		})
		// divBody.scrollTop = divBody.scrollHeight + 500;
		console.log(allUsers, myProfile, room);
		socketRoom.on("event-write", (data : any) => {
            if (data.write)
				loginWrite = data.write[0];
			else
				loginWrite = "";
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

	function updateCurrentUser(id : number) {
		if (allUsers) {
			for (let i = 0; i < allUsers.length; i++) {
				if (allUsers[i].id == id) {
					currentUser = allUsers[i];
					break;
				}
			}
		}
	}

	function handleSubmit(e : any) {
		if (e.key === "Enter")
			submitMp();
	}

	function changeInput() {
		if (inputMp == "") {
			socketRoom.emit("unwrite", {user_receive : allUsers, room, login : myProfile.login})
		}
		else {
			socketRoom.emit("write", {user_receive : allUsers, room, login : myProfile.login});
		}
	}

	function submitMp() {
		if (inputMp != "") {
			for (let i = 0; i < room.user.length; i++) {
				if (room.user[i].id != myProfile.id) {
					// socketMp.emit("send-mp", {id_user_send : myProfile.id, id_user_receive : room.user[i].id ,id_room : room.id, content : inputMp})
					// socketMp.emit("unwrite", {user_receive : otherProfile, room, login : myProfile.login});
				}
			}
			inputMp = "";
		}
	}

	function getLoginWrite() {
		console.log(room.write);
		
		if (room.write) {
			for (let i = 0; i < room.write.length; i++) {
				for (let j = 0; j < allUsers.length; j++) {
					if (room.write[i] == allUsers[j].login) {
						return allUsers[j].login;
					}
				}
			}
		}
		return undefined;
	}
</script>

{#if allUsers && myProfile && room}
	<div class="mp-modal">
		<div class="header {active}" on:dblclick={updateActive}>
			<p>{room.name}</p>
			<button on:click={() => room = undefined}>
				<SvgCancel />
			</button>
		</div>
		<div class="body  {active}" bind:this={divBody}>
			<!-- {#each room.mp as mp, i}
				{#if mp.id_user_send == myProfile.id}
					{#if !room.mp[i - 1] && myProfile}
						<div>
							<div class="avatar">
								<Avatar src={myProfile.img_link} rounded class="object-cover" />
								<p>{myProfile.login}</p>
								<p>{getDate(mp)}</p>
							</div>
							<p class="msg">
								{mp.content}
							</p>
						</div>
					{:else if (room.mp[i - 1] && myProfile && room.mp[i - 1].id_user_send != myProfile.id) && ((room.mp[i + 1] && myProfile && room.mp[i + 1].id_user_send != myProfile.id) || !room.mp[i + 1])}
						<div class="solo">
							<div class="avatar">
								<Avatar src={myProfile.img_link} rounded class="object-cover" />
								<p>{myProfile.login}</p>
								<p>{getDate(mp)}</p>
							</div>
							<p class="msg end">
								{mp.content}
							</p>
						</div>
					{:else if room.mp[i - 1] && myProfile && room.mp[i - 1].id_user_send != myProfile.id}
						<div>
							<div class="avatar">
								<Avatar src={myProfile.img_link} rounded class="object-cover" />
								<p>{myProfile.login}</p>
								<p>{getDate(mp)}</p>
							</div>
							<p class="msg">
								{mp.content}
							</p>
						</div>
					{:else if room.mp[i + 1] && myProfile && room.mp[i + 1].id_user_send == myProfile.id}
						<p class="msg">
							{mp.content}
						</p>
					{:else}
						<p class="msg end">
							{mp.content}
						</p>
					{/if}
				{:else}
					{updateCurrentUser(mp.id_user_send)}
					{#if !room.mp[i - 1] && currentUser}
						<div>
							<div class="avatar">
								<Avatar src={currentUser.img_link} rounded class="object-cover" />
								<p>{currentUser.login}</p>
								<p>{getDate(mp)}</p>
							</div>
							<p class="msg">
								{mp.content}
							</p>
						</div>
					{:else if (room.mp[i - 1] && currentUser && room.mp[i - 1].id_user_send != currentUser.id) && ((room.mp[i + 1] && currentUser && room.mp[i + 1].id_user_send != currentUser.id) || !room.mp[i + 1])}
						<div class="solo">
							<div class="avatar">
								<Avatar src={currentUser.img_link} rounded class="object-cover" />
								<p>{currentUser.login}</p>
								<p>{getDate(mp)}</p>
							</div>
							<p class="msg end">
								{mp.content}
							</p>
						</div>
					{:else if room.mp[i - 1] && currentUser && room.mp[i - 1].id_user_send != currentUser.id}
						<div>
							<div class="avatar">
								<Avatar src={currentUser.img_link} rounded class="object-cover" />
								<p>{currentUser.login}</p>
								<p>{getDate(mp)}</p>
							</div>
							<p class="msg">
								{mp.content}
							</p>
						</div>
					{:else if room.mp[i + 1] && currentUser && room.mp[i + 1].id_user_send == currentUser.id}
						<p class="msg">
							{mp.content}
						</p>
					{:else}
						<p class="msg end">
							{mp.content}
						</p>
					{/if}
				{/if}
			{/each} -->
			<div class="typing {(loginWrite != "")? 'active' : ''}">
				<span class="login">{loginWrite}</span>
				<span>write a msg</span> 
				<div class="dot-typing"></div>
			</div>
			<!-- {#if room.mp.length == 0}
				Start a new conversation in {room.name}
			{/if} -->
		</div>
		<div class="send {active}">
			<input placeholder="Send a message" class="send-msg focus:outline-none focus:ring-0" type="text" bind:value={inputMp} on:keypress={handleSubmit} on:input={changeInput}/>
		</div>
	</div>
{/if}