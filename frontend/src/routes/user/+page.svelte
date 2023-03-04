<script lang="ts">
    import { GetOneUser } from '$lib/userUtils';
	import { Avatar, Card, Tabs, TabItem,  Dropdown, DropdownItem, MenuButton, } from "flowbite-svelte";
    import { onMount } from 'svelte';
    import { myProfileDataStore, userProfileDataStore, usersDataStore } from '$lib/store/user';
    import { socketFriendStore, socketUserStore } from '$lib/store/socket';
    import UserCard from '../../modules/htmlComponent/userCard.svelte';
    import HeaderUserCard from '../../modules/htmlComponent/headerUserCard.svelte';
    import CardRank from '../../modules/htmlComponent/cardRank.svelte';
    import SvgMsg from '../../modules/htmlComponent/svgMsg.svelte';
    import SvgAdd from '../../modules/htmlComponent/svgAdd.svelte';
    import SvgDelete from '../../modules/htmlComponent/svgDelete.svelte';
    import UserActivity from '../../modules/htmlComponent/userActivity.svelte';

    let allUsers : any;
    let myProfile : any;
    let userProfile : any;
    let socketFriend : any;
    let socketUser : any;
    let hasId : boolean = false;

    myProfileDataStore.subscribe(val => myProfile = val);
	userProfileDataStore.subscribe(val => userProfile = val);
    usersDataStore.subscribe(val => allUsers = val);
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
        <div class="grid grid-cols-1 md:grid-cols-2 gap-20">
            <Card padding="none" class="!bg-third !border-none">
                <div class="flex flex-col gap-5 items-center bg-secondary p-3 rounded-tl rounded-tr px-20">
                    <div class="space-y-2">
                        <MenuButton />
                        <Dropdown class="w-36">
                            {#if myProfile.block_id && myProfile.block_id.includes(userProfile.id)}
                                <DropdownItem on:click={() => socketUser.emit("unblock_user", { id_user_send : myProfile.id, id_user_receive : userProfile.id})}>Unblock this user</DropdownItem>
                            {:else}
                                <DropdownItem on:click={() => socketUser.emit("block_user", { id_user_receive : userProfile.id, id_user_send : myProfile.id})}>Block this user</DropdownItem>
                            {/if}
                        </Dropdown>
                        <Avatar size="xl" src={userProfile.img_link} class="object-cover" rounded/>
                    </div>
                    <div class="flex gap-7">
                        <UserActivity user={userProfile}/>
                        <div>{userProfile.login}</div>
                    </div>
                </div>
                <div class="flex items-center justify-around gap-3 p-3">
                    {#if userProfile.block_id && userProfile.block_id.includes(myProfile.id)}
                        <div>This user blocked you</div>
                    {:else if myProfile.block_id && !myProfile.block_id.includes(userProfile.id)}
                        {#if myProfile.req_send_friend && myProfile.req_send_friend.includes(userProfile.id)}
                            <button on:click={() => socketFriend.emit("cancel_friend", {id_user_send : myProfile.id, id_user_receive : userProfile.id})}>
                                <SvgDelete />
                            </button>
                        {:else if myProfile.req_received_friend && myProfile.req_received_friend.includes(userProfile.id)}
                            <button on:click={() => handleClickAcceptFriend(userProfile)}>
                                <SvgAdd />
                            </button>
                        {:else if myProfile.friend_id && myProfile.friend_id.includes(userProfile.id)}
                            <button on:click={() => socketFriend.emit('delete_friend', { id_user_send : myProfile.id, id_user_receive : userProfile.id})}>
                                <SvgDelete />
                            </button>
                        {:else}
                            <button on:click={() => socketFriend.emit('add_friend', { user_send : myProfile, user_receive : userProfile})}>
                                <SvgAdd />
                            </button>
                        {/if}
                        <button>
                            <SvgMsg />
                        </button>
                    {/if}
                </div>
            </Card>
			<CardRank user={userProfile} />
        </div>

        <Tabs defaultClass="w-full flex flex-row gap-2" contentClass="w-full">
			<TabItem title="Friend" open defaultClass="w-full"> 
                {#if userProfile.friend_id && userProfile.friend_id.length == 0}
                    No friend
                {:else if allUsers}
                    <div class="flex flex-col gap-5 mt-5">
                        <HeaderUserCard />
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
		</Tabs>
    </div>
{/if}