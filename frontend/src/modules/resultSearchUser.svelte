<script lang="ts">
    import { GetOneUser } from '$lib/userUtils';
	import {Card} from 'flowbite-svelte'
    import { searchInputStore, userProfileDataStore, usersComponentStore } from '../store';


	export let user : any;

	function handleClick(){
		GetOneUser(user.id)
		.then((res) => {
			userProfileDataStore.set(res.data);
		})
		searchInputStore.set("")
		usersComponentStore.set([]);
	}
</script>

<a href={`/users?id=${user.id}`} on:click={handleClick}>
	<Card img={user.img_link} horizontal>
		<h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{user.login}</h5>
	</Card>
</a>