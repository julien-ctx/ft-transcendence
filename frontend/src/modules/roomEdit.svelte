<script lang="ts">
	import { onMount } from 'svelte';
	import { Modal, Label, Input, Button } from 'flowbite-svelte'


	export let modalEdit : boolean;
	export let socket : any;
	export let room : any;
	let show = false;
	let color = "blue";
	let password : string = '';
	let error : string = '';
	let succesFirst = false;

	onMount(() => {
		console.log(room.name);
	})

	function verifPassword(event : KeyboardEvent) {
		if (event.key == "Enter" && password !== '') 
			socket.emit('verifPassword', {roomName: room, password: password});
		// password = '';
	}

	socket.on('successVerify', () => {
		succesFirst = true;
	});

	socket.on('wrongEdit', (res : string) => {
		error = res;

	});

	socket.on('successEdit', () => {
		modalEdit = false;
	});

	let newPass = '';
	let newConfirmPass = '';
	let title = `Edit ${room}`

	let passError = '';

	function changePass() {
		if (newPass !== newConfirmPass ) {
			passError = "Passwords don't match";
			newPass = '';
			newConfirmPass = '';
		} else if (newPass !== '' && newConfirmPass !== '') {
			socket.emit('changePass', {roomName: room, Pass: newPass, Cpass : newConfirmPass});
		}
	}
</script>

<!-- <Modal title={title} bind:open={modalEdit} {color}> -->
	<div>
		{#if succesFirst === false}
			<div class="flex justify-center">
				<Label for="show-password" class="mb-2">Your current password</Label>
			</div>
			<Input id="show-password" type={show ? 'text' : 'password'} placeholder="Your current password" size="lg" bind:value={password} on:keydown={verifPassword}>
				<button slot="left" on:click={() => (show = !show)} class="pointer-events-auto">
					{#if show}
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
					{:else}
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
					{/if}
				</button>
			</Input>
			{#if error !== ''}
				<p class="text-red-500 text-sm">{error}</p>
			{/if}
		{:else}
			<div class="flex justify-center">
				<Label for="show-password" class="mb-2">Your new password</Label>
			</div>
			<Input id="show-password" type={show ? 'text' : 'password'} placeholder="Your new password" size="lg" bind:value={newPass}>
				<button slot="left" on:click={() => (show = !show)} class="pointer-events-auto">
					{#if show}
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
					{:else}
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
					{/if}
				</button>
			</Input>
			{#if passError !== ''}
				<p class="text-red-500 text-sm">{passError}</p>
			{/if}
			<br>
			<div class="flex justify-center">
				<Label for="show-password" class="mb-2">Confirm password</Label>
			</div>
			<Input id="show-password" type={show ? 'text' : 'password'} placeholder="Confirm password" size="lg" bind:value={newConfirmPass}>
				<button slot="left" on:click={() => (show = !show)} class="pointer-events-auto">
					{#if show}
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
					{:else}
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
					{/if}
				</button>
			</Input>
			<br>
			<div class="flex justify-center">
				<Button outline-color="blue" on:click={() => changePass()}>Submit</Button>
			</div>
		{/if}
	</div>
<!-- </Modal> -->