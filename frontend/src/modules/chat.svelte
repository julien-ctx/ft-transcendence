<script lang="ts">
	import { onMount } from 'svelte';
	import { io } from 'socket.io-client';
	import { AuthGuard } from "$lib/store/AuthGuard";
	import { goto } from "$app/navigation";
	import { getJwt, removeJwt } from "$lib/jwtUtils";
	import { Modal, Textarea, Alert, ToolbarButton, FloatingLabelInput, Button, CloseButton } from 'flowbite-svelte'
	import Message from './customMessage.svelte';

	export let socket : any;
	export let channel : string;
	export let modalChat : boolean;

	let placement = "bottom-left";
	let size = "xl";

	let messages : string[] = [];
	let messageBody : any[] = [];
	let currentMessage : string = '';
	onMount(async () => {
		// console.log(placement);
		socket.emit('askMessages', {
			roomName : channel
		});
	});

	socket.on('getMessages', (receivedMsg : any) => {
		messageBody.push({message : receivedMsg.message, user : receivedMsg.user});
		console.log(messageBody);
		messageBody = [...messageBody];
		// console.log({messages})
		// messages = [...messages];
		// console.log('new message');
	});

	function sendMessages(event : KeyboardEvent) {
		if (event.key === 'Enter' && currentMessage !== '') {
			socket.emit('sendMessage', {
				roomName : channel, 
				message : currentMessage
			});
			currentMessage = '';
			return ;
		}
	}

	let title = `${channel}\'s room`;
</script>

<Modal bind:open={modalChat} title={title} {placement} {size} >
	{#each messageBody as msg}
		<!-- <div>{msg.message}</div> -->
		<Message bind:Message={msg.message} bind:idUser={msg.user}/>
	{/each}

	<br>
	<div class="flex justify-center">
		<FloatingLabelInput style="filled" id="floating_filled" name="floating_filled" type="text" label="Your message" bind:value={currentMessage} on:keydown={sendMessages}/>
	</div>
</Modal>
