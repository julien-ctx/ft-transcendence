<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import {Avatar, Dropdown, DropdownHeader, DropdownItem, DropdownDivider} from 'flowbite-svelte'
    import { AuthGuard } from '../modules/AuthGuard';
    import { userData } from '../store';
    import { UpdateProfileToStore } from '$lib/profileUtils';

	let user : any;

	userData.subscribe(val => {
		user = val;
	})
	onMount(() => {
		AuthGuard()
		.then((res) => {
			UpdateProfileToStore(res.data);
		})
		.catch((err) => {
			console.log(err);
		})
	})

</script>

{#if user.login}
	<header class="flex items-center space-x-4 justify-center">
		<nav>
			<ul>
				<li aria-current={$page.url.pathname === '/' ? 'page' : undefined}>
					<a href="/">Home</a>
				</li>
				<li aria-current={$page.url.pathname === '/game' ? 'page' : undefined}>
					<a href="/game">Game</a>
				</li>
			</ul>
		</nav>
		<Avatar id="user-drop" src={user.img_link} dot={{color:'green'}} />
		<Dropdown triggeredBy="#user-drop">
		<DropdownHeader>
			<span class="block text-sm">{user.login}</span>
		</DropdownHeader>
		<DropdownItem href="/profile">Profile</DropdownItem>
		<DropdownDivider />
		<DropdownItem href="/logout">Logout</DropdownItem>
		</Dropdown>
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
