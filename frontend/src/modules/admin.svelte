<script lang="ts">
	import { onMount } from "svelte";
	import axios from "axios";
	import { Modal, Select, Button, Chevron, Dropdown, DropdownItem } from 'flowbite-svelte';
	import { getJwt } from "$lib/jwtUtils";

	export let socket : any;
	export let room : string;
	let members : any = [];

	onMount(async () => {
		try {
			console.log(room);
			await axios.get(`http://localhost:4000/Chat/getMembers/${room}`, {
				headers: {
					Authorization: `Bearer ${getJwt()}`,
				},
			})
			.then((res) => {
				members = res.data;
				console.log(res);
			});
		} catch (error) {
			console.log(error);
		}
		console.log(members)
	});

	function admin() {
		socket.emit('sanction', {
			roomName: room,
			sanction: sanction,
			member: selected,
			time: time,
			duration: duration,
		})
	}

	let selected = '';
	let sanction = '';
	let time = '';
	let duration = '';
</script>

{#if members.length > 0}
	<select bind:value={sanction}>
		<option value="kick">Kick</option>
		<option value="ban">Ban</option>
		<!-- <option value="unban">Unban</option> -->
		<option value="mute">Mute</option>
		<!-- <option value="unmute">Unmute</option> -->
	</select>
	<select bind:value={selected}>
	<option>Choose a member</option>
		{#each members as member}
			<option>{member.login}</option>
		{/each}
	</select>
	{#if sanction == 'ban' || sanction == 'mute'}
		<input type="number" id="tentacles" name="tentacles" min="1" max="60" bind:value={time}>
		<select bind:value={duration}>
			<option>Second</option>
			<option>Day</option>
			<option>Month</option>
		</select>
	{/if}
	<button on:click={() => admin()}>Apply</button>
{/if}
