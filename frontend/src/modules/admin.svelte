<script lang="ts">
	import { onMount } from "svelte";
	import axios from "axios";
	import { Modal, Select, Button, Chevron, Dropdown, DropdownItem } from 'flowbite-svelte';
	import { getJwt } from "$lib/jwtUtils";
	import { API_URL } from "$lib/env";
	import Hammer from './htmlComponent/svgHammer.svelte';
	import Mute from './htmlComponent/svgMute.svelte';
	import Close from './htmlComponent/svgComponent/svgClose.svelte';
	import Door from './htmlComponent/svgDoor.svelte';
	import Upgrade from './htmlComponent/svgUpgrade.svelte';
	export let socket : any;
	export let room : string;
	export let infoChannel : any;
	let members : any = [];
	let current : any;

	onMount(async () => {
		current = infoChannel.filter((Chan : any) => Chan.name === room)[0];
		console.log('Current ->', current.owner);
		try {
			// console.log(room);
			await axios.get(`${API_URL}/Chat/getMembers/${room}`, {
				headers: {
					Authorization: `Bearer ${getJwt()}`,
				},
			})
			.then((res) => {
				members = res.data;
				// console.log(res);
			});
		} catch (error) {
			console.log(error);
		}
		console.log('Members ->', members)

		socket.on('deletedMember', (data : any) => {
			console.log('Data ->', data);
			members.filter((mem : any) => mem.user.id_user === data.id_user);
			console.log('New members ->', members);
		});
	});

	function admin(sanction : string, Punished : any) {
		console.log(sanction);
		members.filter((mem : any) => mem.user.login !== Punished);
		socket.emit('sanction', {
			roomName: room,
			sanction: sanction,
			member: Punished,
			time: time,
			duration: duration,
		})
	}

	function Kick(Punished : any) {
		socket.emit('sanction', {
			roomName: room,
			sanction: 'kick',
			member: Punished,
			time: '',
			duration: '',
		})
	}

	function OP(Punished : any) {
		socket.emit('OP', {
			roomName: room,
			member: Punished,
		});
	}

	let selected = '';
	// let sanction = '';
	let time = '';
	let duration = '';
</script>


{#if members.length > 0}
	<div>
		{#each members as member}
			<div class="flex justify-between gap-2">
				{member.user.login}
				{#if member.admin && member.owner === false}
					<div class="bg-light_yellow rounded border">
						Admin
					</div>
				{:else if member.ower}
					<div class="!bg-light_blue rounded border">
						Owner
					</div>
				{:else}
					<div class="bg-light_green rounded border">
						Member
					</div>
				{/if}
				{#if current.owner === true}
					{#if member.admin === false}
						<Upgrade />
						<Dropdown class="w-full">
							<DropdownItem>
								<div class="flex justify-center">
									<button on:click={() => OP(member.user)}>
										<div>OP {member.user.login}</div>
									</button>
								</div>
							</DropdownItem>
						</Dropdown>
					{/if}
					<Close />
					<Dropdown class="w-full">
						<DropdownItem>
							<div class="flex justify-center">
								<button on:click={() => Kick(member.user)}>
									<div>Kick {member.user.login}</div> 
								</button>
							</div>
						</DropdownItem>
					</Dropdown>
					<Mute />
					<Dropdown class="w-full">
						<DropdownItem>
							<div class="flex justify-between">
								<input type="number" id="tentacles" name="tentacles" min="1" max="60" bind:value={time}>
								<select bind:value={duration}>
									<option value="Second">Second</option>
									<option value="Minutes">Minutes</option>
									<option value="Hour">Hour</option>
									<option value="Day">Day</option>
									<option value="Month">Month</option>
								</select>
								<div class="justify-center">
									<Door />
								</div>
							</div>
						</DropdownItem>
					</Dropdown>
					<Hammer />
					<Dropdown class="w-full">
						<DropdownItem>
							<div class="flex justify-between">
								<input type="number" id="tentacles" name="tentacles" min="1" max="60" bind:value={time}>
								<select bind:value={duration}>
									<option value="Second">Second</option>
									<option value="Minutes">Minutes</option>
									<option value="Hour">Hour</option>
									<option value="Day">Day</option>
									<option value="Month">Month</option>
								</select>
								<button on:click={() => admin('ban', member.user)}>
									<Door />
								</button>
							</div>
						</DropdownItem>
					</Dropdown>
				{:else if current.admin === true && member.owner === false && member.admin === false}
					<Upgrade />
					<Dropdown class="w-full">
						<DropdownItem>
							<div class="flex justify-center">
								<div>OP {member.user.login}</div> 
							</div>
						</DropdownItem>
					</Dropdown>
					<Close />
					<Dropdown class="w-full">
						<DropdownItem>
							<div class="flex justify-center">
								<button on:click={() => Kick(member.user)}>
									<div>Kick {member.user.login}</div> 
								</button>
							</div>
						</DropdownItem>
					</Dropdown>
					<Mute />
					<Dropdown class="w-full">
						<DropdownItem>
							<div class="flex justify-between">
								<input type="number" id="tentacles" name="tentacles" min="1" max="60">
								<select>
									<option value="Second">Second</option>
									<option value="Minutes">Minutes</option>
									<option value="Hour">Hour</option>
									<option value="Day">Day</option>
									<option value="Month">Month</option>
								</select>
								<div class="justify-center">
									<Door />
								</div>
							</div>
						</DropdownItem>
					</Dropdown>
					<Hammer />
					<Dropdown class="w-full">
						<DropdownItem>
							<div class="flex justify-between">
								<input type="number" id="tentacles" name="tentacles" min="1" max="60">
								<select>
									<option value="Second">Second</option>
									<option value="Minutes">Minutes</option>
									<option value="Hour">Hour</option>
									<option value="Day">Day</option>
									<option value="Month">Month</option>
								</select>
								<div class="justify-center">
									<Door on:click={() => admin('ban', member.user)}/>
								</div>
							</div>
						</DropdownItem>
					</Dropdown>
				{/if}
			</div>
		{/each}
	</div>
{/if}