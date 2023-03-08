<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
    import { AuthGuard } from '$lib/store/AuthGuard';
    import { myProfileDataStore, myRoomMpStore, userProfileDataStore, usersDataStore } from '$lib/store/user';
    import { UpdateProfileConnected, UpdateProfileToStore } from '$lib/profileUtils';
    import { goto } from '$app/navigation';
    import { getJwt, removeJwt } from '$lib/jwtUtils';
    import { socketFriendStore, socketMpStore, socketUserStore } from '$lib/store/socket';
	import { Navbar, NavBrand, NavLi, NavUl, NavHamburger, Avatar, Dropdown, DropdownItem, DropdownHeader, DropdownDivider } from 'flowbite-svelte'
    import { GetAllMyRoom, GetAllUsers } from '$lib/userUtils';
    import { io } from 'socket.io-client';
    import Notifications from '../modules/notifications.svelte';
    import { API_URL } from '$lib/env';
	

	let myProfile : any;
	let userProfile : any;
	let allUsers : any;
	let socketUser : any;
	let socketFriend : any;
	let myRoomMp : any;

	myProfileDataStore.subscribe(val => myProfile = val);
	usersDataStore.subscribe(val => allUsers = val);
	userProfileDataStore.subscribe(val => userProfile = val);
	socketUserStore.subscribe(val => socketUser = val);
	socketFriendStore.subscribe(val => socketFriend = val);
	myRoomMpStore.subscribe(val => myRoomMp = val);

	onMount(async () => {
		await AuthGuard()
		.then(async (res) => {
			await UpdateProfileConnected(1)
			.then((res) => {
				UpdateProfileToStore(res.data);
			})
		})
		.catch((err) => {
			if (err.response.status == 401) {
				removeJwt();
				goto("/login")
			}
		})

		await GetAllUsers()
		.then((res) => {
			usersDataStore.set(res.data);
		})

		await GetAllUsers()
		.then((res) => {
			usersDataStore.set(res.data);
		})
    
		await GetAllMyRoom()
		.then((res) => {
			myRoomMpStore.set(res.data);
		})

		let socketUser = io(API_URL, {
			path: "/event_user",
			query : { token : getJwt()}
		});
		socketUser.on("update_me", (data : any) => {
			UpdateProfileToStore(data);
		})
		socketUser.on("event_user", (data : any) => {
			if (data.id && userProfile.id && data.id == userProfile.id)
				userProfileDataStore.set(data);
			if (allUsers && allUsers.length != 0) {
				let arrId : number [] = [];
				for (let i = 0; i < allUsers.length; i++) {
					if (allUsers[i].id == data.id) {
						allUsers[i] = data;
						usersDataStore.set(allUsers)
						arrId.push(data.id);
					}
				}
				if (arrId && !arrId.includes(data.id)) {
					allUsers.push(data)
					usersDataStore.set(allUsers);
				}
			}                                                                                                                              
		})

		socketUserStore.set(socketUser);
		
		let socketFriend = io(API_URL, {
			path: "/notif_friend",
			query : { token : getJwt()}
		});
		socketFriend.on('event_friend', (data : any) => {
			console.log("event friend", data);
			if (data.id && userProfile.id && data.id == userProfile.id)
				userProfileDataStore.set(data);
			else if (data.id && myProfile.id == data.id)
				UpdateProfileToStore(data);			
		});
		socketFriendStore.set(socketFriend);
	})

</script>

{#if myProfile && myProfile.first_name}
<div class="relative">
	<Navbar let:hidden let:toggle navClass="!bg-primary !border-secondary border-b w-full px-2 sm:px-4 py-2.5">
	<NavBrand href="/">
		<img src="https://flowbite.com/docs/images/logo.svg" class="mr-3 h-6 sm:h-9" alt="Flowbite Logo"/>
	</NavBrand>
	<div class="flex items-center md:order-2 gap-4">
		<Notifications/>
		<Avatar id="avatar-menu" src={myProfile.img_link} class="object-cover bg-transparent" rounded/>
		<NavHamburger on:click={toggle} class1="button-ham w-full md:flex md:w-auto md:order-1 bg-primary"/>
	</div>
	<Dropdown placement="bottom" triggeredBy="#avatar-menu" frameClass="!bg-primary">
		<DropdownHeader>
		<span class="block capitalize">{myProfile.login}</span>
		</DropdownHeader>
		<DropdownItem href="/profile" defaultClass="font-medium py-2 px-4 text-sm hover:text-third block transition-colors duration-300">Profile</DropdownItem>
		<DropdownDivider />
		<DropdownItem href="/logout" defaultClass="font-medium py-2 px-4 text-sm hover:text-red-600 block transition-colors duration-300">Sign out</DropdownItem>
	</Dropdown>
	<NavUl {hidden} ulClass="bg-primary flex gap-5 flex-col sm:flex-row items-center !border-none nav-ul">
		<NavLi href="/" active={$page.url.pathname === '/'? true : false}  activeClass="text-third hover:text-black transition-colors duration-300" nonActiveClass="text-black hover:text-third transition-colors duration-300">Home</NavLi>
		<NavLi href="/users" active={$page.url.pathname === '/users'? true : false} activeClass="text-third hover:text-black transition-colors duration-300" nonActiveClass="text-black hover:text-third transition-colors duration-300">Users</NavLi>
		<NavLi href="/game" active={$page.url.pathname === '/game'? true : false} activeClass="text-third hover:text-black transition-colors duration-300" nonActiveClass="text-black hover:text-third transition-colors duration-300">Game</NavLi>
		<NavLi href="/chat" active={$page.url.pathname === '/chat'? true : false} activeClass="text-third hover:text-black transition-colors duration-300" nonActiveClass="text-black hover:text-third transition-colors duration-300">Chat</NavLi>
	</NavUl>
	</Navbar>
</div>
{/if}