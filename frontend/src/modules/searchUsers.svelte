<script lang="ts">
	import {Button, Search} from 'flowbite-svelte'
	import { onMount } from 'svelte';
    import { usersData } from '../store';
	import { GetAllUsers } from '$lib/userUtils';

	let users : any;

	let searchInput = '';

	usersData.subscribe(val => {
		users = val;
	});
	onMount(() => {
		GetAllUsers()
		.then((res) => {
			usersData.set(res.data);
		})
	})

	function handleChange() {
		console.log(searchInput);
	}

	function handleSubmit() {
		console.log("submit");
	}
</script>

<form id="example-form" on:submit={handleSubmit}>
	<Search bind:value={searchInput} on:keypress={handleChange}/>
	<p>You are seaching: {searchInput}</p>
	<Button type="submit">Submit</Button>
  </form>