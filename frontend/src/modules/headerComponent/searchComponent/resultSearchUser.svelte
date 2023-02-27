<script lang="ts">
    import { GetOneUser } from '$lib/userUtils';
	import { Avatar, Card } from 'flowbite-svelte'
    import { searchInputStore, userProfileDataStore, usersComponentStore } from '$lib/store/user';


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
	<Card horizontal>
		<Avatar src={user.img_link} class="object-cover"/>
		<h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{user.login}</h5>
	</Card>
</a>