<script lang="ts">
    import { GetOneUser } from '$lib/userUtils';
	import { Avatar, Card, Dropdown, DropdownItem, MenuButton } from "flowbite-svelte";
    import { onMount } from 'svelte';
    import { userProfileStore } from '../../store';

	let isMount : boolean = false;
	let hasId : boolean = false;
	let user : any;

	userProfileStore.subscribe(val => {
		user = val;
	})	

	onMount(() => {
		const urlParams = new URLSearchParams(window.location.search);
		hasId = urlParams.has("id");
		if (hasId) {
			let id : any = urlParams.get("id");
			GetOneUser(id)
			.then((res) => {
				userProfileStore.set(res.data);
				isMount = true;
			})
		}
	})
</script>

{#if isMount}
	<div class="container mx-auto flex items-center flex-col">
		<Card padding="sm" size="md">
			<div class="flex items-center space-x-4">
				<Avatar size="xl" src={user.img_link}/>
				<div class="space-y-1 font-medium dark:text-white">
					<div>Login: {user.login}</div>
					<div>Firstname: {user.first_name}</div>
					<div>Lastname: {user.last_name}</div>
					<div>Email: {user.email}</div>
				</div>
			</div>
		</Card>
	</div>
{/if}