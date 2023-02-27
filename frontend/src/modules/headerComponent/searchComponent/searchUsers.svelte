<script lang="ts">
	import {Button, Search} from 'flowbite-svelte'
	import { onMount } from 'svelte';
    import { searchInputStore, usersComponentStore, usersDataStore } from '$lib/store/user';
	import { GetAllUsers } from '$lib/userUtils';
    import ResultSearchUser from './resultSearchUser.svelte';

	let users : any;
	let usersComponent : any;
	let searchInput : string;

	usersDataStore.subscribe(val => {
		users = val;
	});

	usersComponentStore.subscribe(val => {
		usersComponent = val;
	})

	searchInputStore.subscribe(val => {
		searchInput = val;
	})

	function handleChange() {
		searchInputStore.set(searchInput);
		if (searchInput !== "") {
			users.forEach((elem : any) => {
				const toComp = elem.login.substr(0, searchInput.length);
				if (toComp == searchInput) {
					if (!usersComponent.includes(elem)) {
						usersComponent.push(elem);
					}
				}
				else if (usersComponent.includes(elem)){
					usersComponent.pop(elem);
				}
			});
		} else
			usersComponentStore.set([])
		usersComponentStore.set(usersComponent)
	}
</script>

<div>
	<div class="flex gap-2">
		<Search bind:value={searchInput} on:input={handleChange}/>
		<Button size='sm'>
			<svg class="w-5 h-5 mr-2 -ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
			Search
		</Button>
	</div>
	<div class="static">
		<div class="absolute flex gap-2 flex-col">
			{#each usersComponent as user}
				<ResultSearchUser user={user}/>
			{/each}
		</div>
	</div>
</div>


