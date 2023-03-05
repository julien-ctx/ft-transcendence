<script lang="ts">
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
            <button class="button-block">...</button>
            <Dropdown class="w-36 !hover:bg-primary">
                {#if  myProfile.block_id && myProfile.block_id.includes(user.id)}
                    <DropdownItem on:click={() => socketUser.emit("unblock_user", { id_user_send : myProfile.id, id_user_receive : user.id })} class="!bg-primary rounded !hover:bg-primary hover:text-third transition-colors duration-300">Unblock this user</DropdownItem>
                {:else}
                    <DropdownItem on:click={() => socketUser.emit("block_user", { id_user_send : myProfile.id, id_user_receive : user.id })} class="!bg-primary rounded !hover:bg-primary hover:text-third transition-colors duration-300">Block this user</DropdownItem>
                {/if}
            </Dropdown>
        {:else}
            <div class="p-2"></div>
        {/if}
        <Avatar size="lg" src={user.img_link} class="object-cover" rounded/>
    </div>
    <div class="flex md:items-center justify-center capitalize font-medium md:flex-wrap md:flex-row flex-col gap-2">
        <span class="font-medium block md:hidden">Nickname :</span>
        <p>{user.login}</p>
    </div>
    <div class="flex gap-2 items-center justify-center">
        <UserActivity user={user}/>
    </div>
    <div class="flex items-center justify-center flex-wrap gap-2">
        <p class="font-medium block md:hidden">Level :</p>
        <p>{user.level}</p>
    </div>
    {#if user.winrate <= 50.0}
        <div class="flex items-center justify-center text-red-700 flex-wrap gap-2">
            <p class="font-medium block md:hidden">WR :</p>
            <p>{user.winrate}%</p>
        </div>
    {:else if user.winrate <= 65.0}
        <div class="flex items-center justify-center text-orange-400 flex-wrap gap-2">
            <p class="font-medium block md:hidden">WR :</p>
            <p>{user.winrate}%</p>
        </div>
    {:else}
        <div class="flex items-center justify-center text-green-600 flex-wrap gap-2">
            <p class="font-medium block md:hidden">WR :</p>
            <p>{user.winrate}%</p>
        </div>
    {/if}
    <div class="flex items-center justify-center">
        {#if user.ranking == 0}
            <img src="/badge-bronze.png" alt="" width="48">
        {:else if user.ranking == 1}
            <img src="/badge-silver.png" alt="" width="48">
        {:else if user.ranking == 2}
            <img src="/badge-gold.png" alt="" width="48">
        {/if}
    </div>
    <div class="flex items-center justify-center gap-3 col-span-2 md:col-span-1">
        {#if myProfile.id != user.id}
            {#if !myProfile.block_id.includes(user.id) && !user.block_id.includes(myProfile.id)}
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
            <button on:click={handleGotoUser}>
                <SvgProfile />
            </button>
        {:else}
            <button on:click={() => goto("/profile")}>
                <SvgProfile />
            </button>
        {/if}
    </div>
</div>