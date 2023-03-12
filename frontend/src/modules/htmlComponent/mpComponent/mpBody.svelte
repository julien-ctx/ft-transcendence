<script lang="ts">
    import { socketFriendStore } from "$lib/store/socket";
	import { myProfileDataStore } from "$lib/store/user";
    import { Avatar } from "flowbite-svelte";
    import { afterUpdate } from "svelte";

	export let room : any;
	export let active : string;
	export let otherProfile : any;
	let divBody : any;
	let myProfile : any;
	let socketFriend : any;
	

	myProfileDataStore.subscribe(val => myProfile = val);
	socketFriendStore.subscribe(val => socketFriend = val);

	afterUpdate(() => {
		divBody.scrollTop = divBody.scrollHeight + 500;
	})
	
	function getDate(mp : any) : string {
		const date = new Date(mp.createdAt);
		const hour = date.getHours();
		const minutes = date.getMinutes();
		return hour.toString().padStart(2, "0") + " h " + minutes.toString().padStart(2, "0");
	}

	function getUser(id : number) {
		for (let i = 0; i < room.user.length; i++) {
			if (room.user[i].id == id) {
				return room.user[i];
			}
		}
	}
</script>

<div class="body  {active}" bind:this={divBody}>
	{#each room.mp as mp, i}
		{#if !room.mp[i - 1] || room.mp[i - 1] && room.mp[i - 1].id_user_send != room.mp[i].id_user_send}
			<div>
				<div class="avatar">
					<Avatar src={getUser(mp.id_user_send).img_link} rounded class="object-cover" />
					<p>{getUser(mp.id_user_send).login}</p>
					<p>{getDate(mp)}</p>
				</div>
				<p class="msg">
					{mp.content}
				</p>
			</div>
		{:else if (room.mp[i - 1] && room.mp[i - 1].id_user_send != room.mp[i].id_user_send) && ((room.mp[i + 1] && room.mp[i + 1].id_user_send != room.mp[i].id_user_send) || !room.mp[i + 1])}
			<div>
				<div class="avatar">
					<Avatar src={getUser(mp.id_user_send).img_link} rounded class="object-cover" />
					<p>{getUser(mp.id_user_send).login}</p>
					<p>{getDate(mp)}</p>
				</div>
				<p class="msg">
					{mp.content}
				</p>
			</div>
		{:else if room.mp[i + 1] && room.mp[i + 1].id_user_send == room.mp[i].id_user_send}
			<p class="msg">
				{mp.content}
			</p>
		{:else}
			<p class="msg end">
				{mp.content}
			</p>
		{/if}
	{/each}
	<div class="typing {(room.write && room.write.includes(otherProfile.login))? 'active' : ''}">
		<span class="login">{otherProfile.login} </span>
		<span>write a msg</span> 
		<div class="dot-typing"></div>
	</div>
	{#if room.mp.length == 0}
		Start a new conversation with {otherProfile.login}
	{/if}
</div>

