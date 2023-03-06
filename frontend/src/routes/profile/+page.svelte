<script lang="ts">
    import { UpdateProfileImg, UpdateProfileLogin, UpdateProfileToStore } from "$lib/profileUtils";
	import { Avatar, Tooltip, Card, Dropdown } from "flowbite-svelte";
    import { myProfileDataStore, usersDataStore } from "$lib/store/user";
    import { socketFriendStore, socketUserStore } from "$lib/store/socket";
    import axios from "axios";
    import { getJwt } from "$lib/jwtUtils";
    import CardRank from "../../modules/htmlComponent/cardRank.svelte";
    import UserActivity from "../../modules/htmlComponent/userActivity.svelte";
    import SvgCancel from "../../modules/htmlComponent/svgCancel.svelte";
    import SvgConfirm from "../../modules/htmlComponent/svgConfirm.svelte";
    import SvgEdit from "../../modules/htmlComponent/svgEdit.svelte";
    import Svg2faEnable from "../../modules/htmlComponent/svg2faEnable.svelte";
    import Svg2faDisabled from "../../modules/htmlComponent/svg2faDisabled.svelte";
    import TabUser from "../../modules/htmlComponent/tabUser.svelte";

	let fileInput : any;
	let isEditLogin : boolean = false;
	let myProfile : any;
	let loginTmp : any;
	let allUsers : any;
	let socketFriend : any;
	let socketUser : any;
	let errorLogin : boolean = false;
	let errorImage : boolean = false;
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
			errorImage = false;
		})
		.catch((err) => {
			errorImage = true;
		})
	}

	async function submitFormLogin() {
		if (loginTmp != myProfile.login) {
			await UpdateProfileLogin(loginTmp)
			.then((res) => {
				UpdateProfileToStore(res.data);
				socketUser.emit("update_user", res.data);
				isEditLogin = false;
				errorLogin = false;
			})
			.catch((err) => {
				if (err.response.status == 403)
					errorLogin = true;				
			})
		} else {
			isEditLogin = false;
			errorLogin = false;
		}
	}

	function handleKeyPress(e : any) {
		if (e.key === 'Enter')
			submitFormLogin();
	}

	async function enbaledTwoFA() {
		await axios.post("http://localhost:4000/auth/2fa/enable", "" ,{
			headers : {
				Authorization : `Bearer ${getJwt()}`
			}
		})
		.then((res) => {
			UpdateProfileToStore(res.data);
		})
	}

	async function disabledTwoFA() {
		await axios.post("http://localhost:4000/auth/2fa/disable", {user : myProfile} ,{
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
	<div class="container mx-auto mt-10 p-5 flex justify-center flex-col items-center">
		<div class="grid grid-cols-1 md:grid-cols-2 gap-20">
			<Card padding="none" class="!bg-secondary !border-none">
                <div class="flex flex-col gap-5 items-center bg-primary p-3 rounded-tl rounded-tr px-20">
                    <div class="space-y-2">
						<p class="text-red-500">
							{#if errorImage}
								Unsupported mimetype
							{/if}
						</p>
						<button class="button-card-user">...</button>
						<Dropdown class="w-36 !hover:bg-primary bg-primary rounded">
							<label for="file" class="w-full cursor-pointer p-1 hover:text-third transition-colors duration-300 block w-full">
								Edit
								<input type="file" bind:this={fileInput} on:change={submitFormImg} class="hidden" name="file" id="file">
							</label>
						</Dropdown>
                        <Avatar size="xl" src={myProfile.img_link} class="object-cover bg-transparent" rounded/>
					</div>
                    <div class="flex gap-3 items-center">
                        <UserActivity user={myProfile}/>
						{#if !isEditLogin}
							<div class="capitalize">{myProfile.login}</div>
							<button on:click={() => isEditLogin = true}>
								<SvgEdit />
							</button>
						{:else}
							<div>
								<span class="text-red-500">
									{#if errorLogin}
										Login is not unique !
									{/if}
								</span>
								<input id="login" class="focus:outline-none focus:ring-0" type="text" bind:value={loginTmp} on:keypress={handleKeyPress}/>
							</div>
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
						<button on:click={enbaledTwoFA} id="enabledTwoFa">
							<Svg2faDisabled />
							<Tooltip triggeredBy="#enabledTwoFa">Enabled 2FA</Tooltip>
						</button>
					{:else}
						<button on:click={disabledTwoFA} id="disabledTwoFA">
							<Svg2faEnable />
							<Tooltip triggeredBy="#disabledTwoFA">Disabled 2FA</Tooltip>
						</button>
					{/if}
                </div>
            </Card>
			<CardRank user={myProfile} />
		</div>
		<TabUser user={myProfile} />
	</div>
{/if}