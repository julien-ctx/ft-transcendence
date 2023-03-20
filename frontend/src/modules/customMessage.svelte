<script lang="ts">
    import { usersDataStore } from '$lib/store/user';
	import { onMount } from 'svelte';
	import { Avatar, Hr } from 'flowbite-svelte';
    import axios from 'axios';
	export let idUser : any;
	export let Message : any;
	let allUsers : any;
	let currentUser : {};
	usersDataStore.subscribe(val => allUsers = val);
	onMount(async () => {
		console.log(idUser, Message);
		if (allUsers) {
			allUsers.forEach((user : any) => {
				if (user.id_user == idUser) {
					currentUser = user;
				}
			})
		}
		console.log(currentUser);
	});
</script>

{#if currentUser !== undefined}
	<div class="flex gap-4">
		<Avatar src={currentUser.img_link} class="object-cover bg-transparent" alt=""></Avatar>
		<div>{Message}</div>
		
	</div>
	<Hr width="w-full" height="h-1"/>
{/if}