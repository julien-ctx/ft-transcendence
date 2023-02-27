<script lang="ts">
	import { onMount } from 'svelte';
	import { io } from 'socket.io-client';
	import { AuthGuard } from "$lib/AuthGuard";
	import { goto } from "$app/navigation";
	import { getJwt, removeJwt } from "$lib/jwtUtils";
	import { Modal, Textarea, Alert, ToolbarButton, FloatingLabelInput, Button, CloseButton } from 'flowbite-svelte'

	export let socket : any;
	export let channel : string;
	export let modalChat : boolean;

	let placement = "bottom-left";
	let size = "xl";

	let messages : string[] = [];
	let currentMessage : string = '';
	onMount(async () => {
		console.log(placement);
		socket.emit('askMessages', {
			roomName : channel
		});
	});

	socket.on('getMessages', (receivedMsg : string) => {
		messages.push(receivedMsg);
		console.log(receivedMsg);
		messages = [...messages];
	});

	function sendMessages(event : KeyboardEvent) {
		// let msg = (document.getElementById('floating_filled') as HTMLInputElement).value;
		if (event.key === 'Enter' && currentMessage !== '') {
			socket.emit('sendMessage', {
				roomName : channel, 
				message : currentMessage
			});
			currentMessage = '';
			console.log('enter');
			return ;
		}
	}

	let title = `${channel}\'s room`;
</script>

<Modal bind:open={modalChat} title={title} {placement} {size} >
	{#each messages as msg}
		<div>{msg}</div>
	{/each}
	<br>
	<div class="flex justify-center">
		<FloatingLabelInput style="filled" id="floating_filled" name="floating_filled" type="text" label="Your message" bind:value={currentMessage} on:keydown={sendMessages}/>
	</div>
</Modal>
