<script lang="ts">
    import { onMount } from "svelte";
	import axios from "axios";
    import { goto } from "$app/navigation";
    import { getJwt, setJwt } from "$lib/jwtUtils";
    import { io } from "socket.io-client";
    import { myProfileDataStore } from "$lib/store/user";
    import { Button, Modal, Heading, Input, Helper} from "flowbite-svelte";
    import { inputClass, buttonClass } from '$lib/classComponent'

	let qrCode : string;
	let userIntra : any;
	let currentUser : any;
	let code2fa : string;
	let qrCodeModal : boolean = false;
	let isSend : boolean = false;
	let color : any = "base"

	const imgCarousel = [
		{
			id: 0,
			imgurl : "image-1.png"
		},
		{
			id: 1,
			imgurl : "image-2.png"
		},
		{
			id: 2,
			imgurl : "image-3.png"
		}
	]
	onMount(async () => {		
		const urlParams = new URLSearchParams(window.location.search);
		const hasCode = urlParams.has("code");
		if (hasCode && urlParams.get("code") != "") {
			const code = urlParams.get("code");
			await axios.post("https://api.intra.42.fr/oauth/token", {
				grant_type : "authorization_code",
				client_id : "u-s4t2ud-30852b8b9a7314be3ebf1c95396eaf181b1395e1320bd92b2dc092f4ffbb8aa6",
				client_secret : "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",
				code : code,
				redirect_uri : "http://localhost:5173/login",
			})
			.then(async (res) => {
				await axios.get("https://api.intra.42.fr/v2/me", { 
					headers :  {
						Authorization: `Bearer ${res.data.access_token}`
					}
				})
				.then(async (res) => {
					userIntra = {
						id: res.data.id,
						email: res.data.email,
						login: res.data.login,
						first_name: res.data.first_name,
						last_name: res.data.last_name,
						img_link: res.data.image.link,
					};
					await axios.post("http://localhost:4000/auth/signin", {
						id: res.data.id,
						email: res.data.email,
						login: res.data.login,
						first_name: res.data.first_name,
						last_name: res.data.last_name,
						img_link: res.data.image.link,
					})
					.then(async (resAccessToken) => {
						await axios.get(`http://localhost:4000/auth/one/${userIntra.id}`)
						.then(async (res) => {
							currentUser = res.data;
							if (currentUser.twoFaEnabled) {
								await axios.post("http://localhost:4000/auth/2fa/getQrCode", {user : currentUser})
								.then((res) => {
									qrCode = res.data;
									qrCodeModal = true;
								})
							} else {
								isSend = true;
								setJwt(resAccessToken.data.access_token);
								io('http://localhost:4000', {
									path: "/event_user",
									query : { token : getJwt()}
								});
								console.log("curent", currentUser);
								myProfileDataStore.set(currentUser);
								goto("/");
							}
						})
					})
					.catch((err) => console.log(err))
				})
				.catch((err) => console.log(err))
			})
			.catch((err) => console.log(err));
		}
	})

	async function submit2fa() {
		await axios.post("http://localhost:4000/auth/2fa/login", {
			code2fa : code2fa,
			dto : userIntra,
			user : currentUser
		})
		.then(async (res) => {
			setJwt(res.data.access_token);
			io('http://localhost:4000', {
				path: "/event_user",
				query : { token : getJwt()}
			});
			currentUser.twoFaAuth = true;
			myProfileDataStore.set(currentUser);
			goto("/");
		})
		.catch((err) => {
			console.log(err);
			color = "red";
		})
	}
</script>
<div class="h-full flex flex-col justify-center items-center gap-40">
	{#if !qrCodeModal && !isSend}
		<Heading tag="h1" color="text-third" class="text-center">TRANSCENDENCE</Heading>
		<Button class={buttonClass} href="https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-30852b8b9a7314be3ebf1c95396eaf181b1395e1320bd92b2dc092f4ffbb8aa6&redirect_uri=http%3A%2F%2Flocalhost%3A5173%2Flogin&response_type=code">
		<span>Login</span>
		<svg aria-hidden="true" class="ml-3 w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
		</Button>
	{/if}
	<Modal bind:open={qrCodeModal} size="xs" autoclose={false} class="w-full !bg-third" permanent={true} backdropClasses="bg-primary">
		<div class="flex flex-col justify-center gap-5">
			<div>
				<img src={qrCode} alt="" class="mx-auto">
			</div>	
			<div class="flex flex-col justify-center items-center gap-5">
				<div>
					<Helper helperClass="mb-2 font-medium h-6" color="red">
					{#if color == "red"}
							Invalid code !
					{/if}
					</Helper>
					<Input type="text" id="inputOne" bind:value={code2fa} defaultClass={inputClass} color={color}/>
				</div>
				<Button on:click={submit2fa} class={buttonClass}>
					<span>Login</span>
					<svg aria-hidden="true" class="ml-3 w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
				</Button>
			</div>
		</div>
	  </Modal>
</div>
