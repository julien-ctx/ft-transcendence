<script lang="ts">
	import { Accordion, AccordionItem, TabItem, Tabs } from "flowbite-svelte";
    import UserCard from "../../modules/htmlComponent/userCard.svelte";
    import HeaderUserCard from "../../modules/htmlComponent/headerUserCard.svelte";
    import { myProfileDataStore, usersDataStore } from "$lib/store/user";
    import GameHistory from "./gameHistory.svelte";

	export let user : any;
	let allUsers : any;
	let myProfile : any;

	usersDataStore.subscribe(val => allUsers = val);
	myProfileDataStore.subscribe(val => myProfile = val);

</script>

<Tabs defaultClass="w-full flex flex-row gap-2 mt-10 !border-0 tabs-item" contentClass="w-full">
	<TabItem title="Friends" open defaultClass="w-full"> 
		<Accordion defaultClass="w-full mt-5 accordion">
			<AccordionItem>
				<span slot="header">{user.friend_id.length}
					Friends
				</span>
				<div class="flex flex-col gap-5 p-5">
				{#if user.friend_id && user.friend_id.length == 0}
					No friends
				{:else}
					<HeaderUserCard />
					{#each allUsers as friend}
						{#if user.friend_id && user.friend_id.includes(friend.id)}
							<UserCard user={friend} />
						{/if}
					{/each}
				{/if}
				</div>
			</AccordionItem>
			{#if user.id == myProfile.id}
				<AccordionItem>
					<span slot="header">{(user.notification) ? user.notification.length : '0'} Pending requests</span>
					{#if user.notification && user.notification.length > 0}
						<HeaderUserCard />
						{#each user.notification as notif}
							{#each allUsers as otherUser}
								{#if notif.id_user_send == otherUser.id}
									<UserCard user={otherUser} />
								{/if}
							{/each}
						{/each}
					{:else if user.notification && user.notification.length == 0}
						No Data
					{/if}
				</AccordionItem>
				<AccordionItem>
					<span slot="header">{(user.req_send_friend) ? user.req_send_friend.length : '0'} Requests sent</span>
					{#if user.req_send_friend && user.req_send_friend.length > 0}
						<div class="flex flex-col gap-5 p-5">
							<HeaderUserCard />
						{#each user.req_send_friend as req}
							{#each allUsers as otherUser}
								{#if otherUser.id == req}
									<UserCard user={otherUser} />
								{/if}
							{/each}
						{/each}
						</div>
					{:else if user.req_send_friend && user.req_send_friend.length == 0}
						No Data
					{/if}
				</AccordionItem>
			{/if}
		</Accordion>
	</TabItem>
	<TabItem title="History" defaultClass="w-full">
		<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
			{#if user.gameHistory}
				<GameHistory gameHistory={user.gameHistory} />
			{/if}
		</div>
	</TabItem>
	<TabItem title="Achievements" defaultClass="w-full">
		<div class="container-achievements">
			<div class="achievement shadow-md p-5 rounded-lg">
				<img src="./first-win.png" alt="">
				<p>First Win</p>
			</div>
			<div class="achievement shadow-md p-5 rounded-lg">
				<img src="./fanny.png" alt="">
				<p>Fanny</p>
			</div>
			<div class="achievement shadow-md p-5 rounded-lg">
				<img src="./barbate.png" alt="">
				<p>Double Fanny</p>
			</div>
		</div>
	</TabItem>
</Tabs>
