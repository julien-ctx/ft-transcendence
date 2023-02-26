<script lang="ts">
    import { UpdateProfileImg, UpdateProfileLogin, UpdateProfileToStore } from "$lib/profileUtils";
	import { Avatar, Button, Card, Dropdown, DropdownItem, MenuButton } from "flowbite-svelte";
    import { myProfileDataStore, usersDataStore } from "$lib/store/user";
    import { onMount } from "svelte";
    import { getJwt } from "$lib/jwtUtils";
	import io from 'socket.io-client';

	let fileInput : any;
	let isEditLogin : boolean = false;
	let myProfile : any;
	let allUsers : any;
	let socket : any;

	myProfileDataStore.subscribe(val => {
		myProfile = val;
	})

	usersDataStore.subscribe(val => {
		allUsers = val;
	})

	onMount(() => {
		socket = io('http://localhost:4000', {
			path: "/notif_friend",
			query : { token : getJwt()}
		});
		socket.on("event_friend", (data : any) => {
			UpdateProfileToStore(data);			
		});
	})

	async function submitFormImg() {
		const formData = new FormData();
		formData.append('file', fileInput.files[0]);
		UpdateProfileImg(formData)
		.then((res) => {
			UpdateProfileToStore(res.data);
		});
	}

	async function submitFormLogin() {
		UpdateProfileLogin(myProfile.login)
		.then((res) => {
			UpdateProfileToStore(res.data);
			isEditLogin = false;
		});
	}
</script>

{#if myProfile.first_name}
	<div class="container mx-auto flex items-center flex-col gap-10 mt-10">
		<Card padding="sm" size="md">
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
							<button on:click={() => isEditLogin = true}><img src="/stylo-modifier.png" alt=""></button>
						{:else}
							<input type="text" bind:value={myProfile.login}>
							<button on:click={() => isEditLogin = false}><img src="/signe-de-la-croix.png" alt="" width="24"></button>
							<button on:click={submitFormLogin}><img src="/check.png" alt="" width="24"></button>
						{/if}
					</div>
					<div>Firstname: {myProfile.first_name}</div>
					<div>Lastname: {myProfile.last_name}</div>
					<div>Email: {myProfile.email}</div>
				</div>
			</div>
		</Card>
		<Card padding="sm" size="xl">
			My friends
			{#each allUsers as user}
				{#if myProfile.friend_id.includes(user.id)}
					<div class="flex direction-row m-4 gap-4 justify-between">
						<Avatar src={user.img_link} class="object-cover"/>
						<div class="self-end">{user.login}</div>
						<Button href={`/users?id=${user.id}`}>View profile</Button>
						<Button>Invitation play</Button>
						<Button>Private message</Button>
						<Button on:click={() => socket.emit('delete_friend', { user_send : myProfile, user_receive : user})}>Delete friend</Button>
					</div>
				{/if}
			{/each}
			<hr>
			Pending request
			{#each myProfile.notif_friend as notif}
				<div class="flex direction-row m-4 gap-4 justify-between">
					<Avatar src={notif.img_link} class="object-cover"/>
					<div class="self-end">{notif.login_send}</div>
					<Button href={`/users?id=${notif.id_user_send}`}>View profile</Button>
					<Button on:click={() => socket.emit("accept_friend", { user : myProfile, notif})}>Accept friend</Button>
					<Button on:click={() => socket.emit("refuse_friend", {user : myProfile, notif})}>Refuse friend</Button>
				</div>
			{/each}
		</Card>
	</div>
{/if}