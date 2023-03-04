<script lang="ts">
    import { GetOneUser } from '$lib/userUtils';
	import { Avatar, Card, Button, Indicator, Tabs, TabItem } from "flowbite-svelte";
    import { onMount } from 'svelte';
    import { myProfileDataStore, userProfileDataStore, usersHimSelfDataStore } from '$lib/store/user';
    import { socketFriendStore, socketUserStore } from '$lib/store/socket';
    import UserCard from '../../modules/htmlComponent/userCard.svelte';

    let allUsers : any; //With myProfile
    let myProfile : any;
    let userProfile : any;
    let socketFriend : any;
    let socketUser : any;
    let hasId : boolean = false;

    myProfileDataStore.subscribe(val => myProfile = val);
	userProfileDataStore.subscribe(val => userProfile = val);
    usersHimSelfDataStore.subscribe(val => allUsers = val);
	socketFriendStore.subscribe(val => socketFriend = val);
    socketUserStore.subscribe(val => socketUser = val);
        
	onMount(async () => {
		const urlParams = new URLSearchParams(window.location.search);
		hasId = urlParams.has("id");
		if (hasId) {
			let id : any = urlParams.get("id");
			await GetOneUser(id)
			.then((res) => {
				userProfileDataStore.set(res.data);
			});
		}        
	})

	function handleClickAcceptFriend(user : any) {
		let notif : any;
		myProfile.notification.forEach((elem : any) => {
			if (elem.type == 0 && elem.id_user_send == user.id)
				notif = elem;
		});
		socketFriend.emit("accept_friend", { user : myProfile, notif});
	}
</script>

{#if userProfile.id}
    <div class="container mx-auto flex items-center flex-col p-5">
        <Card padding="sm" size="md">
            <div class="flex items-center space-x-4">
                <Avatar size="xl" src={userProfile.img_link} class="object-cover"/>
                <div class="space-y-1 font-medium dark:text-white">
                    {#if userProfile.status === 0}
                        <Indicator color="red"/> Offline
                    {:else if userProfile.status === 1}
                        <Indicator color="green"/> Online
                    {:else if userProfile.status === 2}
                        <Indicator color="blue" /> In game
                    {/if}
                    <div>Login: {userProfile.login}</div>
                    <div>Firstname: {userProfile.first_name}</div>
                    <div>Lastname: {userProfile.last_name}</div>
                    <div>Email: {userProfile.email}</div>
                </div>
            </div>
            {#if myProfile.block_id && myProfile.block_id.includes(userProfile.id)}
                <Button on:click={() => socketUser.emit("unblock_user", { id_user_send : myProfile.id, id_user_receive : userProfile.id})}>Unblock this user</Button>
            {:else}
                <Button on:click={() => socketUser.emit("block_user", { id_user_receive : userProfile.id, id_user_send : myProfile.id})}>Block this user</Button>
            {/if}
            {#if userProfile.block_id && userProfile.block_id.includes(myProfile.id)}
                <div>This user blocked you</div>
            {:else if myProfile.block_id && !myProfile.block_id.includes(userProfile.id)}
                {#if myProfile.req_send_friend && myProfile.req_send_friend.includes(userProfile.id)}
                    <div>Pending request friend</div>
                    <Button on:click={() => socketFriend.emit("cancel_friend", {id_user_send : myProfile.id, id_user_receive : userProfile.id})}>Cancel request</Button>
                {:else if myProfile.req_received_friend && myProfile.req_received_friend.includes(userProfile.id)}
                    <Button on:click={() => handleClickAcceptFriend(userProfile)}>Accept request friend</Button>
                {:else if myProfile.friend_id && myProfile.friend_id.includes(userProfile.id)}
                    <Button on:click={() => socketFriend.emit('delete_friend', { id_user_send : myProfile.id, id_user_receive : userProfile.id})}>Delete friend</Button>
                {:else}
                    <Button on:click={() => socketFriend.emit('add_friend', { user_send : myProfile, user_receive : userProfile})}>Add friend</Button>
                {/if}
            {/if}
        </Card>
        <Tabs defaultClass="w-full flex flex-row gap-2" contentClass="w-full">
			<TabItem title="Friend" open defaultClass="w-full"> 
                {#if userProfile.friend_id && userProfile.friend_id.length == 0}
                    No friend
                {:else if allUsers}
                    <div class="flex flex-col gap-5 mt-5">
                        {#each allUsers as user}
                            {#if userProfile.friend_id.includes(user.id)}
                                <UserCard user={user}/>
                            {/if}
                        {/each}
                    </div>
                {/if}
			</TabItem>
			<TabItem title="Match history" defaultClass="w-full">
			</TabItem>
			<TabItem title="Achievement" defaultClass="w-full">
			</TabItem>
			<TabItem title="League" defaultClass="w-full">
			</TabItem>
			<TabItem title="Level" defaultClass="w-full">
			</TabItem>
		</Tabs>
    </div>
{/if}