<script lang="ts">
    import UserCard from "../../modules/htmlComponent/userCard.svelte";
    import { UpdateProfileImg, UpdateProfileLogin, UpdateProfileToStore } from "$lib/profileUtils";
	import { Accordion, AccordionItem, Avatar, Button, Card, Dropdown, MenuButton, TabItem, Tabs } from "flowbite-svelte";
    import { myProfileDataStore, usersDataStore } from "$lib/store/user";
    import { socketFriendStore, socketUserStore } from "$lib/store/socket";
    import axios from "axios";
    import { getJwt } from "$lib/jwtUtils";
    import HeaderUserCard from "../../modules/htmlComponent/headerUserCard.svelte";
    import CardRank from "../../modules/htmlComponent/cardRank.svelte";
    import UserActivity from "../../modules/htmlComponent/userActivity.svelte";
    import SvgCancel from "../../modules/htmlComponent/svgCancel.svelte";
    import SvgConfirm from "../../modules/htmlComponent/svgConfirm.svelte";
    import SvgEdit from "../../modules/htmlComponent/svgEdit.svelte";
    import Svg2faEnable from "../../modules/htmlComponent/svg2faEnable.svelte";
    import Svg2faDisabled from "../../modules/htmlComponent/svg2faDisabled.svelte";

	let fileInput : any;
	let isEditLogin : boolean = false;
	let myProfile : any;
	let loginTmp : any;
	let allUsers : any;
	let socketFriend : any;
	let socketUser : any;


	myProfileDataStore.subscribe(val => {
		myProfile = val;
		loginTmp = myProfile.login;
	})
	usersDataStore.subscribe(val => allUsers = val);
	socketFriendStore.subscribe(val => socketFriend = val);
	socketUserStore.subscribe(val => socketUser = val);


	async function submitFormImg() {
		const formData = new FormData();
		formData.append('file', fileInput.files[0]);
		await UpdateProfileImg(formData)
		.then((res) => {
			UpdateProfileToStore(res.data);
			socketUser.emit("update_user", res.data);
		});
	}

	async function submitFormLogin() {
		myProfile.login = loginTmp;
		await UpdateProfileLogin(myProfile.login)
		.then((res) => {
			UpdateProfileToStore(res.data);
			socketUser.emit("update_user", res.data);
			isEditLogin = false;
		});
	}

	function handleKeyPress(e : any) {
		if (e.key === 'Enter')
			submitFormLogin();
	}

	async function enbaleTwoFA() {
		await axios.post("http://localhost:4000/auth/2fa/enable", "" ,{
			headers : {
				Authorization : `Bearer ${getJwt()}`
			}
		})
		.then((res) => {
			UpdateProfileToStore(res.data);
		})
	}

	async function disableTwoFA() {
		await axios.post("http://localhost:4000/auth/2fa/disable", "" ,{
			headers : {
				Authorization : `Bearer ${getJwt()}`
			}
		})
		.then((res) => {
			UpdateProfileToStore(res.data);
		})
	}


</script>
{#if myProfile && myProfile.first_name}
	<div class="container mx-auto flex items-center flex-col gap-10 mt-10">
		<div class="grid grid-cols-1 md:grid-cols-2 gap-20">
			<Card padding="none" class="!bg-secondary !border-none">
                <div class="flex flex-col gap-5 items-center bg-primary p-3 rounded-tl rounded-tr px-20">
                    <div class="space-y-2">
						<MenuButton />
						<Dropdown class="w-36">
							<label for="file" class="w-full cursor-pointer p-1">
								Edit
								<input type="file" bind:this={fileInput} on:change={submitFormImg} class="hidden" name="file" id="file">
							</label>
						</Dropdown>
                        <Avatar size="xl" src={myProfile.img_link} class="object-cover" rounded/>
                    </div>
                    <div class="flex gap-3 items-center">
                        <UserActivity user={myProfile}/>
						{#if !isEditLogin}
							<div>{myProfile.login}</div>
							<button on:click={() => isEditLogin = true}>
								<SvgEdit />
							</button>
						{:else}
							<input type="text" bind:value={loginTmp} on:keypress={handleKeyPress}/>
							<button on:click={() => {isEditLogin = false; loginTmp = myProfile.login}}>
								<SvgCancel />
							</button>
							<button on:click={submitFormLogin}>
								<SvgConfirm />
							</button>
						{/if}
                    </div>
                </div>
                <div class="flex items-center justify-around gap-3 p-3">
					{#if !myProfile.twoFaEnabled}
						<button on:click={enbaleTwoFA}>
							<Svg2faEnable />
						</button>
					{:else}
						<button on:click={disableTwoFA}>
							<Svg2faDisabled />
						</button>
					{/if}
                </div>
            </Card>
			<CardRank user={myProfile} />
		</div>

		<Tabs defaultClass="w-full flex flex-row gap-2" contentClass="w-full">
			<!-- User friend -->
			<TabItem title="Friend" open defaultClass="w-full"> 
				<Accordion defaultClass="w-full">
					<AccordionItem open={myProfile.friend_id && myProfile.friend_id.length > 0}>
						<span slot="header">My friends</span>
						<div class="flex flex-col gap-5 p-5">
						{#if myProfile.friend_id && myProfile.friend_id.length == 0}
							No friend
						{:else}
							<HeaderUserCard />
							{#each allUsers as user}
								{#if myProfile.friend_id.includes(user.id)}
									<UserCard user={user} />
								{/if}
							{/each}
						{/if}
						</div>
					</AccordionItem>
					<AccordionItem>
						<span slot="header">Pending request</span>
						{#if myProfile.notification && myProfile.notification.length > 0}
							<HeaderUserCard />
							{#each myProfile.notification as notif}
								{#each allUsers as user}
									{#if notif.id_user_send == user.id}
										<UserCard user={user} />
									{/if}
								{/each}
							{/each}
						{:else if myProfile.notification && myProfile.notification.length == 0}
							No Data
						{/if}
					</AccordionItem>
					<AccordionItem>
						<span slot="header">Request send</span>
						{#if myProfile.req_send_friend && myProfile.req_send_friend.length > 0}
							<div class="flex flex-col gap-5 p-5">
								<HeaderUserCard />
							{#each myProfile.req_send_friend as req}
								{#each allUsers as user}
									{#if user.id == req}
										<UserCard user={user} />
									{/if}
								{/each}
							{/each}
							</div>
						{:else if myProfile.req_send_friend && myProfile.req_send_friend.length == 0}
							No Data
						{/if}
					</AccordionItem>
				</Accordion>
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