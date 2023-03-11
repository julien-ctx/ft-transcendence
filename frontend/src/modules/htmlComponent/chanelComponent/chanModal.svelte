<script lang="ts">
    import { currentRoomStore } from "$lib/store/roomStore";
    import { Avatar } from "flowbite-svelte";
	import { afterUpdate, onDestroy, onMount } from "svelte";
    import SvgCancel from "../svgComponent/svgCancel.svelte";

	export let myProfile : any;
	export let socketRoom : any;
	export let usersRoom : any;

	let currentRoom : any;
	let active : string = "";
	let divBody : any;
	let inputMp : any;
	let loginWrite : string = "";
	let muted = '';
	currentRoomStore.subscribe((val) => currentRoom = val);

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
			if (currentRoom != null)
				currentRoomStore.set(data);
		})

		socketRoom.on("muted", (data : any) => {
			console.log(data);
			muted = data;
		});
	})

	afterUpdate(() => {
		if (divBody && divBody.scrollHeight)
			divBody.scrollTop = divBody.scrollHeight + 500;
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

</script>

{#if usersRoom && myProfile && currentRoom}
	<div class="mp-modal">
		<div class="header {active}" on:dblclick={updateActive}>
			<p>{currentRoom.name}</p>
			<button on:click={() => currentRoomStore.set(null)}>
				<SvgCancel />
			</button>
		</div>
		<div class="body {active}" bind:this={divBody}>
			{#if currentRoom.Message}
				{#each currentRoom.Message as mp, i}
					{#if getUser(mp.id_user)}
						{#if !currentRoom.Message[i - 1]}
							<div>
								<div class="avatar">
									<Avatar src={getUser(mp.id_user).img_link} rounded class="object-cover" />
									<p>{getUser(mp.id_user).login}</p>
									<p>{getDate(mp)}</p>
								</div>
								<p class="msg">
									{mp.content}
								</p>
							</div>
						{:else if (currentRoom.Message[i - 1] && currentRoom.Message[i - 1].id_user != currentRoom.Message[i].id_user) && ((currentRoom.Message[i + 1] && currentRoom.Message[i + 1].id_user != currentRoom.Message[i].id_user) || !currentRoom.Message[i + 1])}
							<div class="solo">
								<div class="avatar">
									<Avatar src={getUser(mp.id_user).img_link} rounded class="object-cover" />
									<p>{getUser(mp.id_user).login}</p>
									<p>{getDate(mp)}</p>
								</div>
								<p class="msg end">
									{mp.content}
								</p>
							</div>
						{:else if currentRoom.Message[i - 1] && currentRoom.Message[i - 1].id_user != currentRoom.Message[i].id_user}
							<div>
								<div class="avatar">
									<Avatar src={getUser(mp.id_user).img_link} rounded class="object-cover" />
									<p>{getUser(mp.id_user).login}</p>
									<p>{getDate(mp)}</p>
								</div>
								<p class="msg">
									{mp.content}
								</p>
							</div>
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
			<div class="typing {(loginWrite)? 'active' : ''}">
				<span class="login">{loginWrite}</span>
				<span>write a msg</span> 
				<div class="dot-typing"></div>
				{#if muted !== ''}
					<div class="text-red-500 text-sm">
						<p>{muted}</p>
					</div>
				{/if}
			</div>
			{#if currentRoom.Message && currentRoom.Message.length == 0}
				Start a new conversation in {currentRoom.name}
			{/if}
		</div>
		<div class="send {active}">
			<input placeholder="Send a message" class="send-msg focus:outline-none focus:ring-0" type="text" bind:value={inputMp} on:keypress={handleSubmit} on:input={changeInput}/>
		</div>
	</div>
{/if}