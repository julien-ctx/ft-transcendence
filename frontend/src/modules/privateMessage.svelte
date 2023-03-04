<script lang="ts">
	import { onMount } from 'svelte';
	import { io } from 'socket.io-client';
	import { AuthGuard } from "$lib/store/AuthGuard";
	import { goto } from "$app/navigation";
	import { getJwt, removeJwt } from "$lib/jwtUtils";
	import { socketRoomStore } from '$lib/store/socket';
	import { Button, Modal } from 'flowbite-svelte';

	let socket : any;
	socketRoomStore.subscribe(val => socket = val);

	export let friend : any;
	export let open;

	let title : string = `${friend}`;
	let placement = "bottom-right";

	onMount(() => {
		console.log(friend);
	});
</script>

<Modal title={title} {placement}>
	test
	<!-- <Button on:click={() => open = false}>Close</Button> -->
	<div>
		Lorem ipsum dolor sit amet consectetur adipisicing elit. Totam qui ipsam unde perferendis modi, at impedit sapiente, voluptate nesciunt assumenda asperiores sunt animi itaque aliquid voluptates repudiandae dolor delectus possimus?
	</div>
</Modal>

