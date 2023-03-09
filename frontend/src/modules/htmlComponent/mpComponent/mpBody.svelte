<script lang="ts">
    import { myProfileDataStore } from "$lib/store/user";
    import { Avatar } from "flowbite-svelte";
    import { afterUpdate } from "svelte";

	export let room : any;
	export let active : string;
	export let otherProfile : any;
	let divBody : any;
	let myProfile : any;

	myProfileDataStore.subscribe(val => myProfile = val);

	afterUpdate(() => {
		divBody.scrollTop = divBody.scrollHeight + 500;
	})
	
	function getDate(mp : any) : string {
		const date = new Date(mp.createdAt);
		const hour = date.getHours();
		const minutes = date.getMinutes();
		return hour.toString().padStart(2, "0") + " h " + minutes.toString().padStart(2, "0");
	}
</script>

<div class="body  {active}" bind:this={divBody}>
	{#each room.mp as mp, i}
		{#if mp.id_user_send == myProfile.id}
			{#if !room.mp[i - 1] && myProfile}
				<div>
					<div class="avatar">
						<Avatar src={myProfile.img_link} rounded class="object-cover" />
						<p>{myProfile.login}</p>
						<p>{getDate(mp)}</p>
					</div>
					<p class="msg">
						{mp.content}
						<!-- {#if mp.is_updated}
							<span class="updated">(updated)</span>
						{/if} -->
					</p>
				</div>
			{:else if (room.mp[i - 1] && myProfile && room.mp[i - 1].id_user_send != myProfile.id) && ((room.mp[i + 1] && myProfile && room.mp[i + 1].id_user_send != myProfile.id) || !room.mp[i + 1])}
				<div class="solo">
					<div class="avatar">
						<Avatar src={myProfile.img_link} rounded class="object-cover" />
						<p>{myProfile.login}</p>
						<p>{getDate(mp)}</p>
					</div>
					<p class="msg end">
						{mp.content}
						<!-- {#if mp.is_updated}
							<span class="updated">(updated)</span>
						{/if} -->
					</p>
				</div>
			{:else if room.mp[i - 1] && myProfile && room.mp[i - 1].id_user_send != myProfile.id}
				<div>
					<div class="avatar">
						<Avatar src={myProfile.img_link} rounded class="object-cover" />
						<p>{myProfile.login}</p>
						<p>{getDate(mp)}</p>
					</div>
					<p class="msg">
						{mp.content}
						<!-- {#if mp.is_updated}
							<span class="updated">(updated)</span>
						{/if} -->
					</p>
				</div>
			{:else if room.mp[i + 1] && myProfile && room.mp[i + 1].id_user_send == myProfile.id}
				<p class="msg">
					{mp.content}
					<!-- {#if mp.is_updated}
						<span class="updated">(updated)</span>
					{/if} -->
				</p>
			{:else}
				<p class="msg end">
					{mp.content}
					<!-- {#if mp.is_updated}
						<span class="updated">(updated)</span>
					{/if} -->
				</p>
			{/if}
		{:else}
			{#if !room.mp[i - 1] && otherProfile}
				<div>
					<div class="avatar">
						<Avatar src={otherProfile.img_link} rounded class="object-cover" />
						<p>{otherProfile.login}</p>
						<p>{getDate(mp)}</p>
					</div>
					<p class="msg">
						{mp.content}
						<!-- {#if mp.is_updated}
							<span class="updated">(updated)</span>
						{/if} -->
					</p>
				</div>
			{:else if (room.mp[i - 1] && otherProfile && room.mp[i - 1].id_user_send != otherProfile.id) && ((room.mp[i + 1] && otherProfile && room.mp[i + 1].id_user_send != otherProfile.id) || !room.mp[i + 1])}
				<div class="solo">
					<div class="avatar">
						<Avatar src={otherProfile.img_link} rounded class="object-cover" />
						<p>{otherProfile.login}</p>
						<p>{getDate(mp)}</p>
					</div>
					<p class="msg end">
						{mp.content}
						<!-- {#if mp.is_updated}
							<span class="updated">(updated)</span>
						{/if} -->
					</p>
				</div>
			{:else if room.mp[i - 1] && otherProfile && room.mp[i - 1].id_user_send != otherProfile.id}
				<div>
					<div class="avatar">
						<Avatar src={otherProfile.img_link} rounded class="object-cover" />
						<p>{otherProfile.login}</p>
						<p>{getDate(mp)}</p>
					</div>
					<p class="msg">
						{mp.content}
						<!-- {#if mp.is_updated}
							<span class="updated">(updated)</span>
						{/if} -->
					</p>
				</div>
			{:else if room.mp[i + 1] && otherProfile && room.mp[i + 1].id_user_send == otherProfile.id}
				<p class="msg">
					{mp.content}
					<!-- {#if mp.is_updated}
						<span class="updated">(updated)</span>
					{/if} -->
				</p>
			{:else}
				<p class="msg end">
					{mp.content}
					<!-- {#if mp.is_updated}
						<span class="updated">(updated)</span>
					{/if} -->
				</p>
			{/if}
		{/if}
	{/each}
	<!-- {#if room.write} -->
		<div class="typing {(room.write && room.write.includes(otherProfile.login))? 'active' : ''}">
			<span class="login">{otherProfile.login} </span>
			<span>write a msg</span> 
			<div class="dot-typing"></div>
		</div>
	<!-- {/if} -->
	{#if room.mp.length == 0}
		Start a new conversation with {otherProfile.login}
	{/if}
</div>

