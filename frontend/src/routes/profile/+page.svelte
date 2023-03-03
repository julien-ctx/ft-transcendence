<script lang="ts">
    import { UpdateProfileImg, UpdateProfileLogin, UpdateProfileToStore } from "$lib/profileUtils";
	import { Accordion, AccordionItem, Avatar, Button, Card, Dropdown, DropdownItem, MenuButton, Modal, TabItem, Tabs } from "flowbite-svelte";
    import { myProfileDataStore, userProfileDataStore, usersDataStore } from "$lib/store/user";
    import { socketFriendStore, socketUserStore } from "$lib/store/socket";
    import { onMount } from "svelte";
    import axios from "axios";
    import { getJwt } from "$lib/jwtUtils";

	let fileInput : any;
	let isEditLogin : boolean = false;
	let myProfile : any;
	let loginTmp : any;
	let allUsers : any;
	let socketFriend : any;
	let socketUser : any;


	myProfileDataStore.subscribe(val => {
		myProfile = val;
		loginTmp = myProfile.login;
	})
	usersDataStore.subscribe(val => allUsers = val);
	socketFriendStore.subscribe(val => socketFriend = val);
	socketUserStore.subscribe(val => socketUser = val);


	async function submitFormImg() {
		const formData = new FormData();
		formData.append('file', fileInput.files[0]);
		await UpdateProfileImg(formData)
		.then((res) => {
			UpdateProfileToStore(res.data);
			socketUser.emit("update_user", res.data);
		});
	}

	async function submitFormLogin() {
		myProfile.login = loginTmp;
		await UpdateProfileLogin(myProfile.login)
		.then((res) => {
			UpdateProfileToStore(res.data);
			socketUser.emit("update_user", res.data);
			isEditLogin = false;
		});
	}

	function handleKeyPress(e : any) {
		if (e.key === 'Enter')
			submitFormLogin();
	}

	async function enbaleTwoFA() {
		await axios.post("http://localhost:4000/auth/2fa/enable", "" ,{
			headers : {
				Authorization : `Bearer ${getJwt()}`
			}
		})
		.then((res) => {
			UpdateProfileToStore(res.data);
		})
	}

	async function disableTwoFA() {
		await axios.post("http://localhost:4000/auth/2fa/disable", "" ,{
			headers : {
				Authorization : `Bearer ${getJwt()}`
			}
		})
		.then((res) => {
			UpdateProfileToStore(res.data);
		})
	}


</script>
{#if myProfile && myProfile.first_name}
	<div class="container mx-auto flex items-center flex-col gap-10 mt-10">
		<Card padding="sm" size="xl">
			<div class="flex items-center space-x-4">
				<div class="flex">
					<Avatar size="xl" src={myProfile.img_link} class="object-cover"/>
					<MenuButton/>
					<Dropdown>
						<DropdownItem defaultClass="flex">
							<label for="file" class="w-full cursor-pointer p-1">
								Edit
								<input type="file" bind:this={fileInput} on:change={submitFormImg} class="hidden" name="file" id="file">
							</label>
						</DropdownItem>
					</Dropdown>
				</div>
				<div class="space-y-1 font-medium dark:text-white">
					<div class="flex">
						{#if !isEditLogin}
							<div>{myProfile.login}</div>
							<Button on:click={() => isEditLogin = true}>Edit</Button>
						{:else}
							<input type="text" bind:value={loginTmp} on:keypress={handleKeyPress}>
							<Button on:click={() => {isEditLogin = false; loginTmp = myProfile.login}}>Cancel</Button>
							<Button on:click={submitFormLogin} >Confirm</Button>
						{/if}
					</div>
					<div>Firstname: {myProfile.first_name}</div>
					<div>Lastname: {myProfile.last_name}</div>
					<div>Email: {myProfile.email}</div>
					{#if !myProfile.twoFaEnabled}
						<Button on:click={enbaleTwoFA}>Turn on 2FA</Button>
					{:else}
						<Button on:click={disableTwoFA}>Turn off 2FA</Button>
					{/if}
				</div>
			</div>
		</Card>
		<Tabs defaultClass="w-full flex flex-row gap-2" contentClass="w-full">
			<!-- User friend -->
			<TabItem title="Friend" open defaultClass="w-full"> 
				<Accordion defaultClass="w-full">
					<AccordionItem open={myProfile.friend_id && myProfile.friend_id.length > 0}>
						<span slot="header">My friends</span>
						{#each allUsers as user}
							{#if myProfile.friend_id.includes(user.id)}
								<div class="flex direction-row m-4 gap-4 justify-between">
									<Avatar src={user.img_link} class="object-cover"/>
									<div class="self-end">{user.login}</div>
									{#if user.status == 0}
										<div>Disconnected</div>
									{:else if user.status == 1}
										<div>Connected</div>
									{:else if user.status == 2}
										<div>In game</div>
									{/if}
									<Button href={`/users?id=${user.id}`}>View profile</Button>
									<Button>Invitation play</Button>
									<!-- <Button on:click={() => openDm(user)}>Private message</Button> -->
									<Button on:click={() => socketFriend.emit('delete_friend', { id_user_send : myProfile.id, id_user_receive : user.id})}>Delete friend</Button>
								</div>
							{/if}
						{/each}
						{#if myProfile.friend_id && myProfile.friend_id.length == 0}
							No friend
						{/if}
					</AccordionItem>
					<AccordionItem>
						<span slot="header">Pending request</span>
						{#if myProfile.notification && myProfile.notification.length > 0}
							{#each myProfile.notification as notif}
								{#if notif.type == 0}
									<div class="flex direction-row m-4 gap-4 justify-between">
										<Avatar src={notif.img_link} class="object-cover"/>
										<div class="self-end">{notif.login_send}</div>
										<Button href={`/users?id=${notif.id_user_send}`}>View profile</Button>
										<Button on:click={() => socketFriend.emit("accept_friend", { user : myProfile, notif})}>Accept friend</Button>
										<Button on:click={() => socketFriend.emit("refuse_friend", {user : myProfile, notif})}>Refuse friend</Button>
									</div>
								{/if}
							{/each}
						{:else if myProfile.notification && myProfile.notification.length == 0}
							No Data
						{/if}
					</AccordionItem>
					<AccordionItem>
						<span slot="header">Request send</span>
						{#if myProfile.req_send_friend && myProfile.req_send_friend.length > 0}
							{#each myProfile.req_send_friend as req}
								{#each allUsers as user}
									{#if user.id == req}
										<div class="flex direction-row m-4 gap-4 justify-between">
											<Avatar src={user.img_link} class="object-cover"/>
											<div class="self-end">{user.login}</div>
											<Button href={`/users?id=${user.id}`}>View profile</Button>
											<Button on:click={() => socketFriend.emit("cancel_friend", {id_user_send : myProfile.id, id_user_receive : user.id})}>Cancel request</Button>
										</div>
									{/if}
								{/each}
							{/each}
						{:else if myProfile.req_send_friend && myProfile.req_send_friend.length == 0}
							No Data
						{/if}
					</AccordionItem>
				</Accordion>
			</TabItem>
			<TabItem title="Match history" defaultClass="w-full">
			</TabItem>
			<TabItem title="Achievement" defaultClass="w-full">
			</TabItem>
			<TabItem title="League" defaultClass="w-full">
			</TabItem>
			<TabItem title="Level" defaultClass="w-full">
			</TabItem>
		</Tabs>
	</div>
{/if}