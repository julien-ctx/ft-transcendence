<script lang="ts">
	import { onMount } from "svelte";
	import axios from "axios";
	import { Toggle, Dropdown, DropdownItem, Avatar } from 'flowbite-svelte';
	import { getJwt } from "$lib/jwtUtils";
	import { API_URL } from "$lib/env";
	import Door from './htmlComponent/svgComponent/svgDoor.svelte';
	import { myProfileDataStore, usersDataStore } from "$lib/store/user";
    import { socketUserStore } from "$lib/store/socket";
    import SvgSettings from "./htmlComponent/svgComponent/svgSettings.svelte";

	export let socket : any;
	export let room : string;
	export let infoChannel : any;

	let members : any;
	let current : any = {};
	let Me : any = {};
	let isAdmin = true;

	// Change password
	let currentPass : string = '';
	let newPass : string = '';
	let newPassConfirm : string = '';
	let validatePass : Boolean = false;
	let passError : string = '';

	// Change Room Status
	let change = false;
	let StatusPass : string = '';
	let StatusCPass : string = '';
	let CpassError : string = '';

	let users : any;
	let socketUser : any;
	let myProfile : any;

	usersDataStore.subscribe(val => users = val);
	socketUserStore.subscribe(val => socketUser = val);
	myProfileDataStore.subscribe(val => myProfile = val);

	onMount(async () => {
		current = infoChannel.filter((Chan : any) => Chan.name === room)[0];
		// console.log(current);
		await axios.get(`${API_URL}/Chat/getMembers/${room}`, {
			headers: {
				Authorization: `Bearer ${getJwt()}`,
			},
		})
		.then((res) => {
			members = res.data;
			// console.log(members);
		});

		try {
			await axios.get(`${API_URL}/Chat/getMyRelation/${room}`, {
				headers: {
					Authorization: `Bearer ${getJwt()}`,
				},
			})
			.then((res) => {
				// console.log(res);
				Me = res.data;
				// console.log('Me - > ', Me);
			});
		} catch (error) {
			console.log(error);
		}

		socket.on('deletedMember', (data : any) => {
			let newMembers = [];
			// console.log("Deleted Member ->", {data});
			if (data.id_user === Me.id_user) {
				isAdmin = false;
				return ;
			}
			for (let i = 0; i < members.length; i++) {
				if (members[i].user.id_user !== data.id_user) {
					newMembers.push(members[i]);
				}
			}
			members = newMembers;
		});


		socket.on('newMembers', (data : any) => {
			if (data.roomName !== room) return;
			// console.log(data.member);
			members.push(data.member);
			members = members;			
		});
		socket.on('successVerify', () => {
			validatePass = true;
		});

		socket.on('newRight', (data : any) => {
			if (data.roomName !== room) return;
			if (data.id_user === Me.id_user) {
				if (Me.admin === true && data.admin === false)
					isAdmin = false;
				else if (isAdmin === false && data.admin === true)
					isAdmin = true;
			}
			members = members.map((mem : any) => {
				if (mem.user.id_user === data.id_user) {
					mem.admin = data.admin;
				}
				// console.log("Bew Right Members ->", {mem})
				return mem;
			});
			members = members;
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

		socket.on('successChangeStatus', (data : any) => {
			if (data.roomName !== room) return;
			current.status = data.status;
			change = false;
			current = current;
		});

		socket.on('successEdit', (data : any) => {
			if (data.roomName !== room) return;
			newPass = '';
			newPassConfirm = '';
			validatePass = false;
			currentPass = '';
		});

		socket.on('badPass', (data : any) => {
			if (data.roomName !== room) return;
			CpassError = data.error;
		});

		socket.on('badChangePass', (data : any) => {
			if (data.roomName !== room) return;
			passError = data.error;
		});
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
		// if (newPass !== newPassConfirm ) {
		// 	passError = "Passwords don't match";
		// 	newPass = '';
		// 	newPassConfirm = '';
		// } else if (newPass !== '' && newPassConfirm !== '') {
		// 	socket.emit('changePass', {roomName: room, Pass: newPass, Cpass : newPassConfirm});
		// }

		if (newPass !== '' && newPassConfirm !== '') 
			socket.emit('changePass', {roomName: room, Pass: newPass, Cpass : newPassConfirm});
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

	function changeStatus() {
		CpassError = '';
		if (StatusPass !== '' && StatusCPass !== '') { 
			socket.emit('changeStatus', {
				roomName: room, 
				pass : StatusPass, 
				cpass : StatusCPass
			});
		}
		// else if (StatusPass !== StatusCPass)
		// 	CpassError = "Passwords don't match";
		StatusPass = '';
		StatusCPass = '';
	}
</script>


{#if isAdmin === true}
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
					{#if Me !== undefined && Me.owner === true || Me.admin === true && member.owner === false && member.admin === false}
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

	{#if current.status === 'Public' && Me.owner === true}
		<div class="flex flex-col">
			<div class="flex justify-around">
				<label class="switch">
					<input type="checkbox" on:click={() => {change = !change; StatusPass = ''; StatusCPass = ''}}>
					<span class="slider round"></span>
				</label>
				<div class="py-1">
					Change Status
				</div>
			</div>
			{#if change === true}
				<div class="flex flex-col">
					<input class="rounded m-1" type="password" placeholder="New password" bind:value={StatusPass}>
					<input class="rounded m-1" type="password" placeholder="Confirm password" bind:value={StatusCPass}>
					{#if CpassError !== ''}
						<p class="flex justify-center text-red-500 text-sm">{CpassError}</p>
					{/if}
				</div>
				<div class="flex justify-center">
					<button on:click={() => changeStatus()}>Change Status</button>
				</div>
			{/if}
		</div>
	{/if}

	{#if current.status === 'Protected'}
		<div class="flex justify-center">Change password</div>
		<div class="flex flex-col">
			{#if validatePass === false}
				<input class="rounded m-1" type="password" placeholder="Current password" bind:value={currentPass} on:keydown={verifPassword}>
				<div class="border-t"></div>
			{:else}
				<input class="rounded m-1" type="password" placeholder="New password" bind:value={newPass}>
				<input class="rounded m-1" type="password" placeholder="Confirm password" bind:value={newPassConfirm}>
				{#if passError !== ''}
					<p class="flex justify-center text-red-500 text-sm">{passError}</p>
				{/if}
				<div class="flex justify-center">
					<button on:click={() => changePass()}>Change password</button>
				</div>
			{/if}
		</div>
	{/if}
{/if}

<style>
.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}

/* Hide default HTML checkbox */
.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

/* The slider */
.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  -webkit-transition: .4s;
  transition: .4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  -webkit-transition: .4s;
  transition: .4s;
}

input:checked + .slider {
  background-color: #2196F3;
}

input:focus + .slider {
  box-shadow: 0 0 1px #2196F3;
}

input:checked + .slider:before {
  -webkit-transform: translateX(26px);
  -ms-transform: translateX(26px);
  transform: translateX(26px);
}

/* Rounded sliders */
.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}
</style>