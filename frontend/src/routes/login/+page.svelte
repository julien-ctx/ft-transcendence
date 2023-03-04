<script lang="ts">
    import { onMount } from "svelte";
	import axios from "axios";
    import { goto } from "$app/navigation";
    import { getJwt, setJwt } from "$lib/jwtUtils";
    import { io } from "socket.io-client";
    import { GetOneUser } from "$lib/userUtils";
    // import { AuthGuard } from "$lib/store/AuthGuard";
    import { myProfileDataStore } from "$lib/store/user";

	let qrCode : string;
	let userIntra : any;
	let currentUser : any;

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
								})
							} else {
								setJwt(resAccessToken.data.access_token);
								io('http://localhost:4000', {
									path: "/event_user",
									query : { token : getJwt()}
								});
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

	let input : number;
	async function handleSubmit2fa() {
		await axios.post("http://localhost:4000/auth/2fa/login", {
			code2fa : input,
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
		})
	}

</script>
<div>
	login
	<br>
	<a href="https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-30852b8b9a7314be3ebf1c95396eaf181b1395e1320bd92b2dc092f4ffbb8aa6&redirect_uri=http%3A%2F%2Flocalhost%3A5173%2Flogin&response_type=code">
		Se connecter
	</a>
</div>
<img src={qrCode} alt="">
<input type="text" bind:value={input} />
<button on:click={handleSubmit2fa}>Submit</button>