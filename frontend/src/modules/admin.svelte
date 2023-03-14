<script lang="ts">
	import { onMount } from "svelte";
	import axios from "axios";
	import { Modal, Select, Button, Chevron, Dropdown, DropdownItem, Avatar } from 'flowbite-svelte';
	import { getJwt } from "$lib/jwtUtils";
	import { API_URL } from "$lib/env";
	import Hammer from './htmlComponent/svgComponent/svgHammer.svelte';
	import Mute from './htmlComponent/svgComponent/svgMute.svelte';
	import Close from './htmlComponent/svgComponent/svgClose.svelte';
	import Door from './htmlComponent/svgComponent/svgDoor.svelte';
	import Upgrade from './htmlComponent/svgComponent/svgUpgrade.svelte';
	import { myProfileDataStore, usersDataStore } from "$lib/store/user";
    import { socketUserStore } from "$lib/store/socket";
    import SvgSettings from "./htmlComponent/svgComponent/svgSettings.svelte";

	export let socket : any;
	export let room : string;
	export let infoChannel : any;
	let members : any;
	let current : any = {};

	// Change password
	let currentPass : string = '';
	let newPass : string = '';
	let newPassConfirm : string = '';
	let validatePass : Boolean = false;
	let passError : string = '';

	let users : any;
	let socketUser : any;
	let myProfile : any;

	usersDataStore.subscribe(val => users = val);
	socketUserStore.subscribe(val => socketUser = val);
	myProfileDataStore.subscribe(val => myProfile = val);

	onMount(async () => {
		current = infoChannel.filter((Chan : any) => Chan.name === room)[0];
		await axios.get(`${API_URL}/Chat/getMembers/${room}`, {
			headers: {
				Authorization: `Bearer ${getJwt()}`,
			},
		})
		.then((res) => {
			members = res.data;		
		});
		socket.on('deletedMember', (data : any) => {
			let newMembers = [];
			for (let i = 0; i < members.length; i++) {
				if (members[i].user.id_user !== data.id_user) {
					newMembers.push(members[i]);
				}
			}
			members = newMembers;
		});
		socket.on('newMembers', (data : any) => {
			if (data.roomName !== room) return;

			members.push(data.member);
			members = members;			
		});
		socket.on('successVerify', () => {
			validatePass = true;
		});

		socket.on('newRight', (data : any) => {
			members = members.map((mem : any) => {
				if (mem.user.id_user === data.id_user) {
					mem.admin = data.admin;
				}
				return mem;
			});
		});

		socket.on('unmute', (data : any) => {
			members = members.map((mem : any) => {
				if (mem.user.id_user === data.id_user) {
					mem.Muted = false;
				}
				return mem;
			});
		});

		socket.on('mute', (data : any) => {
			// console.log('Mute ->', {data});
			members = members.map((mem : any) => {
				if (mem.user.id_user === data.id_user) {
					mem.Muted = true;
				}
				return mem;
			});
		});

		socket.on("memberLeaveRoom", async (data : any) => {
				await axios.get(`${API_URL}/Chat/getMembers/${room}`, {
				headers: {
					Authorization: `Bearer ${getJwt()}`,
				},
			})
			.then((res) => {
				members = res.data;		
			});
		})
	});

	function admin(sanction : string, Punished : any) {
		// console.log(sanction);
		members.filter((mem : any) => mem.user.login !== Punished);
		socket.emit('sanction', {
			roomName: room,
			sanction: sanction,
			member: Punished,
			time: time,
			duration: duration,
		});
		resetTime();
	}

	function Kick(Punished : any) {
		// console.log(Punished)
		socket.emit('sanction', {
			roomName: room,
			sanction: 'kick',
			member: Punished,
			time: '',
			duration: '',
		});
		resetTime();
	}

	function OP(Punished : any) {
		socket.emit('OP', {
			roomName: room,
			member: Punished,
		});
		resetTime();
	}

	function DEOP(Punished : any) {
		socket.emit('DEOP', {
			roomName: room,
			member: Punished,
		});
		resetTime();
	}

	function Muted(Punished : any) {
		socket.emit('mute', {
			roomName: room,
			member: Punished,
			time: time,
			duration: duration,
		});
		resetTime();
	}

	function unmute(Punished : any) {
		socket.emit('unmute', {
			roomName: room,
			member: Punished,
		});
		resetTime();
	}

	let selected = '';
	let time = '';
	let duration = '';

	function verifPassword(event : KeyboardEvent) {
		// console.log('test');
		if (event.key == "Enter" && currentPass !== '') 
			socket.emit('verifPassword', {roomName: room, password: currentPass});
	}

	function changePass() {
		passError = '';
		if (newPass !== newPassConfirm ) {
			passError = "Passwords don't match";
			newPass = '';
			newPassConfirm = '';
		} else if (newPass !== '' && newPassConfirm !== '') {
			socket.emit('changePass', {roomName: room, Pass: newPass, Cpass : newPassConfirm});
		}
	}
	
	function userIsInRoomPrivate(user : any) {
		if (!members)
			return false;
		for (let i = 0; i < members.length; i++) {
			if (members[i].id_user == user.id_user)
				return true;		
		}
		return false;
	}

	function resetTime() {
		time = '';
		duration = '';
	}

	function sendNotifPrivate(user : any) {
		socketUser.emit("notification_room", {user_send : myProfile, user_receive : user , room_name : room})
	}
</script>


{#if members && members.length > 0}
	<div class="flex flex-col gap-3">
		{#each members as member}
			<div class="flex justify-between items-center gap-2">
				<Avatar src={member.user.img_link} class="object-cover" rounded/>
				{member.user.login}
				{#if member.admin && member.owner === false}
					<div class="bg-light_yellow rounded border text-xs p-1">
						Admin
					</div>
				{:else if member.owner === true}
					<div class="!bg-light_blue rounded border text-xs p-1">
						Owner
					</div>
				{:else}
					<div class="bg-light_green rounded border text-xs p-1">
						Member
					</div>
				{/if}
				{#if current.owner === true || current.admin === true && member.owner === false && member.admin === false}
					<button class="button-admin" on:click={() => Kick(member.user)}>Kick</button>
					<button>
						<SvgSettings />
					</button>
					<Dropdown>
						<DropdownItem>Mute</DropdownItem>
						{#if member.Muted === false}
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
											<button on:click={() => Muted(member.user)}>
												<Door />
											</button>
										</div>
									</div>
								</DropdownItem>
							</Dropdown>
						{:else}
							<Dropdown class="w-full">
								<DropdownItem>
									<div class="flex justify-between">
										<button on:click={() => unmute(member)}>
											Unmute {member.user.login}
										</button>
									</div>
								</DropdownItem>
							</Dropdown>
						{/if}
						{#if member.admin === false}
							<DropdownItem on:click={() => OP(member.user)}>OP</DropdownItem>
						{:else}
							<DropdownItem on:click={() => DEOP(member.user)}>DE-OP</DropdownItem>
						{/if}
						<DropdownItem>Ban</DropdownItem>
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
					</Dropdown>
				{/if}
			</div>
		{/each}
	</div>
{:else}
	<div class="flex justify-center">
		There is no members
	</div>
{/if}
{#if current.status === 'Private'}
	<div>Invite another user</div>
	{#key members}
		{#each users as user}
			{#if !userIsInRoomPrivate(user) && user.id != myProfile.id}
				<div class="card-private">
					<Avatar src={user.img_link} class="object-cover" rounded/>
					<p>{user.login}</p>
					<button class="button-admin" on:click={() => sendNotifPrivate(user)}>Invite</button>
				</div>
			{/if}
		{/each}
	{/key}
{/if}


{#if current.status === 'Protected'}
	<div class="flex justify-center">Change password</div>
	<div class="flex flex-col">
		{#if validatePass === false}
			<input type="password" placeholder="Current password" bind:value={currentPass} on:keydown={verifPassword}>
			<div class="border-t"></div>
		{:else}
			<input type="password" placeholder="New password" bind:value={newPass}>
			<input type="password" placeholder="Confirm password" bind:value={newPassConfirm}>
			{#if passError !== ''}
				<p class="flex justify-center text-red-500 text-sm">{passError}</p>
			{/if}
			<div class="flex justify-center">
				<button on:click={() => changePass()}>Change password</button>
			</div>
		{/if}
	</div>
{/if}
