<script lang="ts">
	import { slide } from 'svelte/transition';
	import { Avatar, Dropdown, DropdownItem, MenuButton, Indicator } from "flowbite-svelte";
    import { myProfileDataStore, userProfileDataStore, usersDataStore } from '$lib/store/user';
    import { socketFriendStore, socketUserStore } from '$lib/store/socket';
    import SvgAdd from "../../modules/htmlComponent/svgAdd.svelte";
    import SvgDelete from "../../modules/htmlComponent/svgDelete.svelte";
    import SvgProfile from "../../modules/htmlComponent/svgProfile.svelte";
    import SvgMsg from "../../modules/htmlComponent/svgMsg.svelte";
    import { goto } from "$app/navigation";
    import { GetOneUser } from "$lib/userUtils";
    import UserActivity from './userActivity.svelte';

	let socketFriend : any;
	let socketUser : any;
	let myProfile : any;
	let allUsers : any = [];
    export let user : any;

	myProfileDataStore.subscribe(val => myProfile = val)
	usersDataStore.subscribe(val => allUsers = val);
	socketFriendStore.subscribe(val => socketFriend = val);
	socketUserStore.subscribe(val => socketUser = val);

	function handleClickAcceptFriend(user : any) {
		let notif : any;
		myProfile.notification.forEach((elem : any) => {
			if (elem.type == 0 && elem.id_user_send == user.id)
				notif = elem;
		});
		socketFriend.emit("accept_friend", { user : myProfile, notif});
	}

    async function handleGotoUser() {
        await GetOneUser(user.id)
        .then((res) => {
            userProfileDataStore.set(res.data);
        })
        goto(`/user?id=${user.id}`);
    }

</script>

<div class="grid grid-cols-2 gap-5 grid-flow-row sm:grid-cols-7 bg-primary p-3 rounded sm:pb-3 pb-5 div-card-user shadow-md">
    <div class="flex items-center sm:items-start justify-center sm:justify-start sm:flex-row flex-col gap-2">
        {#if myProfile.id != user.id}
            <MenuButton />
            <Dropdown class="w-36">
                {#if  myProfile.block_id && myProfile.block_id.includes(user.id)}
                    <DropdownItem on:click={() => socketUser.emit("unblock_user", { id_user_send : myProfile.id, id_user_receive : user.id })}>Unblock this user</DropdownItem>
                {:else}
                    <DropdownItem on:click={() => socketUser.emit("block_user", { id_user_send : myProfile.id, id_user_receive : user.id })}>Block this user</DropdownItem>
                {/if}
            </Dropdown>
        {:else}
            <div class="p-4"></div>
        {/if}
        <Avatar size="lg" src={user.img_link} class="object-cover" rounded/>
    </div>
    <div class="flex items-center justify-center">
        {user.login}
    </div>
    <div class="flex gap-2 items-center justify-center">
        <UserActivity user={user}/>
    </div>
    <div class="flex items-center justify-center">
        {user.level}
    </div>
    <div class="flex items-center justify-center">
        {user.winrate}
    </div>
    <div class="flex items-center justify-center">
        {user.ranking}
    </div>
    <div class="flex items-center justify-center gap-3">
        {#if myProfile.id != user.id}
            {#if myProfile.block_id && myProfile.block_id.includes(user.id)}
                <button on:click={() => socketUser.emit("unblock_user", { id_user_send : myProfile.id, id_user_receive : user.id})}>
                    Unblock this user
                </button>
            {:else}
                    {#if user.block_id && user.block_id.includes(myProfile.id)}
                        <div>This user blocked you</div>
                    {:else}
                        {#if myProfile.req_send_friend && myProfile.req_send_friend.includes(user.id)}
                            <button on:click={() => socketFriend.emit("cancel_friend", {id_user_send : myProfile.id, id_user_receive : user.id})}>
                                <SvgDelete />
                            </button>
                        {:else if myProfile.req_received_friend && myProfile.req_received_friend.includes(user.id)}
                            <button on:click={() => handleClickAcceptFriend(user)}>
                                <SvgAdd/>
                            </button>
                        {:else if myProfile.friend_id && myProfile.friend_id.includes(user.id)}
                            <button on:click={() => socketFriend.emit('delete_friend', { id_user_send : myProfile.id, id_user_receive : user.id})}>
                                <SvgDelete />
                            </button>
                        {:else}
                            <button on:click={() => socketFriend.emit('add_friend', { user_send : myProfile, user_receive : user})}>
                                <SvgAdd/>
                            </button>
                        {/if}
                    <button>
                        <SvgMsg />
                    </button>
                {/if}
            {/if}
            <button on:click={handleGotoUser}>
                <SvgProfile />
            </button>
            {:else}
                <button on:click={() => goto("/profile")}>My Profile</button>
        {/if}
    </div>
</div>