<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
    import { AuthGuard } from '../lib/AuthGuard';
    import { myProfileDataStore, userProfileDataStore, usersDataStore, usersHimSelfDataStore } from '$lib/store/user';
    import { UpdateProfileToStore } from '$lib/profileUtils';
    import AvatarProfile from '../modules/headerComponent/avatarProfile.svelte';
    import SearchUsers from '../modules/headerComponent/searchUsers.svelte';
    import Notifications from '../modules/headerComponent/notifications.svelte';
    import { goto } from '$app/navigation';
    import { getJwt, removeJwt } from '$lib/jwtUtils';
    import { socketFriendStore, socketUserStore } from '$lib/store/socket';
	import { Navbar, NavBrand, NavLi, NavUl, NavHamburger, Avatar, Dropdown, DropdownItem, DropdownHeader, DropdownDivider } from 'flowbite-svelte'
    import { GetAllUsers } from '$lib/userUtils';
    import axios from 'axios';
    import { io } from 'socket.io-client';
	

	let myProfile : any;
	let userProfile : any;
	let allUsers : any;
	let socketUser : any;
	let socketFriend : any;

	myProfileDataStore.subscribe(val => myProfile = val);
	usersDataStore.subscribe(val => allUsers = val);
	userProfileDataStore.subscribe(val => userProfile = val);
	socketUserStore.subscribe(val => socketUser = val);
	socketFriendStore.subscribe(val => socketFriend = val);

	onMount(async () => {
		await AuthGuard()
		.then((res) => {
			UpdateProfileToStore(res.data);
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

		await axios.get("http://localhost:4000/users/getAllHimSelf", {
		headers : {
			Authorization : `Bearer ${getJwt()}`
		}
		})
		.then((res) => {
			usersHimSelfDataStore.set(res.data);
		});

		let socketUser = io('http://localhost:4000', {
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
				if (!arrId.includes(data.id) && data.id != myProfile.id) {
					allUsers.push(data)
					usersDataStore.set(allUsers);
				}
			}                                                                                                                              
		})

		socketUserStore.set(socketUser);
		
		let socketFriend = io('http://localhost:4000', {
			path: "/notif_friend",
			query : { token : getJwt()}
		});
		socketFriend.on('event_friend', (data : any) => {
			UpdateProfileToStore(data);			
		});
		socketFriendStore.set(socketFriend);
	})

</script>

{#if myProfile && myProfile.first_name}
	<Navbar let:hidden let:toggle navClass="!bg-primary !border-secondary border-b w-full px-2 sm:px-4 py-2.5">
	<NavBrand href="/">
		<img src="https://flowbite.com/docs/images/logo.svg" class="mr-3 h-6 sm:h-9" alt="Flowbite Logo"/>
	</NavBrand>
	<div class="flex items-center md:order-2 gap-4">
		<Notifications/>
		<Avatar id="avatar-menu" src={myProfile.img_link} class="object-cover" rounded/>
		<NavHamburger on:click={toggle} class1="w-full md:flex md:w-auto md:order-1"/>
	</div>
	<Dropdown placement="bottom" triggeredBy="#avatar-menu">
		<DropdownHeader>
		<span class="block text-sm">{myProfile.login}</span>
		<span class="block truncate text-sm font-medium">{myProfile.kind}</span>
		</DropdownHeader>
		<DropdownItem href="/profile">Profile</DropdownItem>
		<DropdownDivider />
		<DropdownItem href="/logout">Sign out</DropdownItem>
	</Dropdown>
	<NavUl {hidden}>
		<NavLi href="/" active={$page.url.pathname === '/'? true : false}  activeClass="text-third hover:text-white transition-colors duration-300" nonActiveClass="text-white hover:text-third transition-colors duration-300">Home</NavLi>
		<NavLi href="/users" active={$page.url.pathname === '/users'? true : false} activeClass="text-third hover:text-white transition-colors duration-300" nonActiveClass="text-white hover:text-third transition-colors duration-300">Users</NavLi>
		<NavLi href="/game" active={$page.url.pathname === '/game'? true : false} activeClass="text-third hover:text-white transition-colors duration-300" nonActiveClass="text-white hover:text-third transition-colors duration-300">Game</NavLi>
		<NavLi href="/chat" active={$page.url.pathname === '/chat'? true : false} activeClass="text-third hover:text-white transition-colors duration-300" nonActiveClass="text-white hover:text-third transition-colors duration-300">Chat</NavLi>
	</NavUl>
	</Navbar>
{/if}