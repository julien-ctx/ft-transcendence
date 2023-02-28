<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
    import { AuthGuard } from '../lib/AuthGuard';
	import { DarkMode } from 'flowbite-svelte';
    import { myProfileDataStore, usersDataStore, usersHimSelfDataStore } from '$lib/store/user';
    import { UpdateProfileToStore } from '$lib/profileUtils';
    import AvatarProfile from '../modules/headerComponent/avatarProfile.svelte';
    import SearchUsers from '../modules/headerComponent/searchComponent/searchUsers.svelte';
    import Notifications from '../modules/headerComponent/notifications.svelte';
    import { goto } from '$app/navigation';
    import { getJwt, removeJwt } from '$lib/jwtUtils';
	import io from 'socket.io-client';
    import { GetAllUsers } from '$lib/userUtils';
    import axios from 'axios';

	let myProfile : any;
	let allUsers : any;
	let socket : any;

	myProfileDataStore.subscribe(val => myProfile = val);
	usersDataStore.subscribe(val => allUsers = val);

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

		await axios.get("http://localhost:4000/users/getAllHimSelf", {
			headers : {
				Authorization : `Bearer ${getJwt()}`
			}
		})
		.then((res) => {
			usersHimSelfDataStore.set(res.data);
		});

		await GetAllUsers()
		.then((res) => {
			usersDataStore.set(res.data);
		})
		
		socket = io('http://localhost:4000', {
			path: "/event_user",
			query : { token : getJwt()}
		});

		socket.on("event_user", (data : any) => {
			if (allUsers.length != 0) {
				for (let i = 0; i < allUsers.length; i++) {
					if (allUsers[i].id == data.id) {
						allUsers[i] = data;
						usersDataStore.set(allUsers)
					}
				}
			}
		})
	})

</script>

{#if myProfile.login}
	<header class="flex items-center space-x-4 justify-center">
		<nav>
			<ul>
				<li aria-current={$page.url.pathname === '/' ? 'page' : undefined}>
					<a href="/">Home</a>
				</li>
				<li aria-current={$page.url.pathname === '/game' ? 'page' : undefined}>
					<a href="/game">Game</a>
				</li>
        		<li aria-current={$page.url.pathname === '/chat' ? 'page' : undefined}>
					<a href="/chat">Chat</a>
			  	</li>
			</ul>
		</nav>
		<DarkMode />
		<SearchUsers />
		<Notifications />
		<AvatarProfile socket={socket}/>
	</header>
{/if}

<style>
	header {
		display: flex;
		justify-content: space-between;
	}

	nav {
		display: flex;
		justify-content: center;
		--background: rgba(255, 255, 255, 0.7);
	}

	ul {
		position: relative;
		padding: 0;
		margin: 0;
		height: 3em;
		display: flex;
		justify-content: center;
		align-items: center;
		list-style: none;
		background: var(--background);
		background-size: contain;
	}

	li {
		position: relative;
		height: 100%;
	}

	li[aria-current='page']::before {
		--size: 6px;
		content: '';
		width: 0;
		height: 0;
		position: absolute;
		top: 0;
		left: calc(50% - var(--size));
		border: var(--size) solid transparent;
		border-top: var(--size) solid var(--color-theme-1);
	}

	nav a {
		display: flex;
		height: 100%;
		align-items: center;
		padding: 0 0.5rem;
		color: var(--color-text);
		font-weight: 700;
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		text-decoration: none;
		transition: color 0.2s linear;
	}

	a:hover {
		color: var(--color-theme-1);
	}
</style>
