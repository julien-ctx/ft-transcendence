<script lang="ts">
    import { socketMpStore } from "$lib/store/socket";
    import { myProfileDataStore, myRoomMpStore } from "$lib/store/user";
    import { GetOneUser } from "$lib/userUtils";
    import { Avatar } from "flowbite-svelte";
    import { onMount, afterUpdate } from "svelte";

	export let room : any;
	let divBody : any;
	let myProfile : any;
	let otherProfile : any;

	myProfileDataStore.subscribe(val => myProfile = val);

	afterUpdate(() => {
		divBody.scrollTop = divBody.scrollHeight + 500;
		for (let i = 0; i < room.user.length; i++) {
			if (room.user[i].id != myProfile.id)
				otherProfile = room.user[i];
		}
		for (let i = 0; i < room.user.length; i++) {
			if (room.user[i].id != myProfile.id) {
				otherProfile = room.user[i];
				break;
			}
		}
	})

	function searchIsEnd(index : number) : boolean {
		return true
	}
</script>

<div class="body" bind:this={divBody}>
	{#each room.mp as mp, i}
		{#if mp.id_user_send == myProfile.id}
			{#if (room.mp[i - 1] && myProfile && room.mp[i - 1].id_user_send != myProfile.id) && (room.mp[i + 1] && myProfile && room.mp[i + 1].id_user_send != myProfile.id || !room.mp[i + 1])}
				<div class="my-msg solo">
					{mp.content}
				</div>
			{:else if room.mp[i - 1] && myProfile && room.mp[i - 1].id_user_send != myProfile.id || !room.mp[i - 1]}
				<div class="my-msg start">
					{mp.content}
				</div>
			{:else if room.mp[i + 1] && room.mp[i + 1].id_user_send == myProfile.id}
				<div class="my-msg">
					{mp.content}
				</div>
			{:else}
				<div class="my-msg end">
					{mp.content}
				</div>
			{/if}

		{:else}
			{#if (room.mp[i - 1] && otherProfile && room.mp[i - 1].id_user_send != otherProfile.id) && ((room.mp[i + 1] && otherProfile && room.mp[i + 1].id_user_send != otherProfile.id) || !room.mp[i + 1])}
				<div class="other-msg solo">
					{mp.content}
				</div>
			{:else if room.mp[i - 1] && otherProfile && room.mp[i - 1].id_user_send != otherProfile.id || !room.mp[i - 1]}
				<div class="other-msg start">
					{mp.content}
				</div>
			{:else if room.mp[i + 1] && otherProfile && room.mp[i + 1].id_user_send == otherProfile.id}
				<div class="other-msg">
					{mp.content}
				</div>
			{:else}
				<div class="other-msg end">
					{mp.content}
				</div>
			{/if}
		{/if}
	{/each}
</div>

