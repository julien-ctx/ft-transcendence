<script lang="ts">
	import { onMount } from "svelte";
	import axios from "axios";
	import { Modal, Select, Button, Chevron, Dropdown, DropdownItem } from 'flowbite-svelte';
	import { getJwt } from "$lib/jwtUtils";
	import { API_URL } from "$lib/env";

	export let socket;
	// export let open : boolean;
	export let room : string;
	let members : any = [];

	onMount(async () => {
		try {
			console.log(room);
			await axios.get(`${API_URL}/Chat/getMembers/${room}`, {
				headers: {
					Authorization: `Bearer ${getJwt()}`,
				},
				// body :  {
				// 	room : room
				// },
			})
			.then((res) => {
				members = res.data;
				console.log(members);
			});
		} catch (error) {
			console.log(error);
		}
		console.log(members)
	});

	let choice = [    
		{value:"BAN", name: "BAN"},
		{value:"MUTE", name: "MUTE"},
		{value:"OP", name: "OP"},
		{value:"KICK", name: "KICK"},
	];
	let selected = '';
	let selectedMember = '';
</script>

<!-- <Modal title="Admin Gestion" bind:open={open} size="xl">
	<div class="flex">
		<Select items={choice} bind:value={selected}></Select>
		<Select bind:value={selectedMember}>
			{#each members as member}
				<option>{member.email}</option>
			{/each}
		</Select>
	</div>
</Modal> -->

<Dropdown class="w-36">
	{#each members as member}
	<DropdownItem>
		<DropdownItem class="flex items-center justify-between"><Chevron placement="right">Dropdown</Chevron></DropdownItem>
		<Dropdown placement="right-start">
			<DropdownItem>Ban</DropdownItem>
			<DropdownItem>Kick</DropdownItem>
			<DropdownItem>Mute</DropdownItem>
		</Dropdown>
	</DropdownItem>
	{/each}
</Dropdown>

