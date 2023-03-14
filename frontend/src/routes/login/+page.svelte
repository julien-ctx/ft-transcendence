<script lang="ts">
    import { onMount } from "svelte";
	import axios from "axios";
    import { goto } from "$app/navigation";
    import { getJwt, setJwt } from "$lib/jwtUtils";
    import { io } from "socket.io-client";
    import { myProfileDataStore } from "$lib/store/user";
    import { Modal,  Helper} from "flowbite-svelte";
    import { API_URL } from "$lib/env";

	let currentUser : any;
	let code2fa : string;
	let qrCodeModal : boolean = false;
	let isSend : boolean = false;
	let color : any = "base"

	onMount(async () => {
		const urlParams = new URLSearchParams(window.location.search);
		if (urlParams.has("code")) {
			await axios.post(`${API_URL}/auth/connexion`, {code : urlParams.get("code")})
			.then(async (res) => {
				setJwt(res.data.access_token);
				await axios.get(`${API_URL}/auth/me`, {headers : { Authorization : `Bearer ${getJwt()}` }})
				.then(async (res) => {
					currentUser = res.data;
					if (currentUser.twoFaEnabled) {
						qrCodeModal = true;
					} else {
						isSend = true;
						io(API_URL, {
							path: "/event_user",
							query : { token : getJwt()}
						});
						myProfileDataStore.set(currentUser);
						goto("/");
					}
				})
			})
		}
	})

	async function submit2fa() {
		await axios.post(`${API_URL}/auth/2fa/login`, {
			code2fa : code2fa,
			user : currentUser
		})
		.then(async (res) => {
			setJwt(res.data.access_token);
			io(API_URL, {
				path: "/event_user",
				query : { token : getJwt()}
			});
			currentUser.twoFaAuth = true;
			myProfileDataStore.set(currentUser);
			goto("/");
		})
		.catch((err) => {
			setTimeout(() => {
				code2fa = "";
			}, 1000)
			color = "red";
		})
	}

	function handleChangeInput2fa() {
		if (code2fa.length == 6)
			submit2fa();
	}
</script>
<div class="h-full flex flex-col justify-center items-center gap-40">
	{#if !qrCodeModal && !isSend}
		<h1 class="text-center">TRANSCENDENCE</h1>
		<a class="a-login" href={import.meta.env.VITE_CLIENT_LINK_INTRA}>
			<span>Login</span>
			<svg aria-hidden="true" class="ml-3 w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
		</a>
	{/if}
</div>
<Modal bind:open={qrCodeModal} size="xs" autoclose={false} class="w-full !bg-primary modal-2fa" permanent={true} backdropClasses="bg-primary">
	<div class="flex flex-col justify-center gap-5">
		<div>
			<!-- <img src={qrCode} alt="" class="mx-auto"> -->
			<h2>Enter you code 2FA</h2>
		</div>	
		<div class="flex flex-col justify-center items-center gap-5">
			<div>
				<Helper helperClass="mb-2 font-medium h-6 text-center" color="red">
				{#if color == "red"}
					Invalid code !
				{/if}
				</Helper>
				<input type="text" id="inputOne" class="focus:outline-none focus:ring-0" bind:value={code2fa} on:input={handleChangeInput2fa}/>
			</div>
		</div>
	</div>
</Modal>
