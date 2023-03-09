<script lang="ts">
    import { Avatar } from "flowbite-svelte";
    import { afterUpdate } from "svelte";
    import MpBody from "./mpBody.svelte";
    import SvgCancel from "../svgComponent/svgCancel.svelte";

	export let room : any;
	export let myProfile : any;
	let otherProfile : any;
	export let socketMp : any;
	let inputMp : any;
	let active : string = "";

	afterUpdate(() => {
		for (let i = 0; i < room.user.length; i++) {
			if (room.user[i].id != myProfile.id) {
				otherProfile = room.user[i];
				break;
			}
		}
	})

	function closeMp(room : any) {
		socketMp.emit("close-room", {id_user : myProfile.id, id_room : room.id})
	}

	function handleSubmit(e : any) {
		if (e.key === "Enter")
			submitMp();
	}

	function changeInput() {
		if (inputMp == "") {
			console.log("vide");
			socketMp.emit("unwrite", {user_receive : otherProfile, room, login : myProfile.login});
		}
		else {
			console.log("plein", inputMp.length);
			socketMp.emit("write", {user_receive : otherProfile, room, login : myProfile.login});
		}
	}

	function submitMp() {
		if (inputMp != "") {
			for (let i = 0; i < room.user.length; i++) {
				if (room.user[i].id != myProfile.id) {
					socketMp.emit("send-mp", {id_user_send : myProfile.id, id_user_receive : room.user[i].id ,id_room : room.id, content : inputMp})
					socketMp.emit("unwrite", {user_receive : otherProfile, room, login : myProfile.login});
				}
			}
			inputMp = "";
		}
	}

	function updateActive() {
		if (active == "")
			active = "active";
		else
			active = ""
	}
</script>
{#if otherProfile && myProfile && room.open_id && room.open_id.includes(myProfile.id) && !otherProfile.block_id.includes(myProfile.id) && !myProfile.block_id.includes(otherProfile.id)}
	<div class="mp-modal">
		<div class="header {active}" on:dblclick={updateActive}>
			<p>{otherProfile.login}</p>
			<button on:click={() => closeMp(room)}>
				<SvgCancel />
			</button>
		</div>
		<MpBody room={room} active={active} otherProfile={otherProfile}/>
		<div class="send {active}">
			<input placeholder="Send a message to {otherProfile.login}" class="send-msg focus:outline-none focus:ring-0" type="text" bind:value={inputMp} on:keypress={handleSubmit} on:input={changeInput}/>
		</div>
	</div>
{/if}

