<script lang="ts">
    import { onMount } from "svelte";
	import axios from "axios";
    import { goto } from "$app/navigation";
    import { getJwt, setJwt } from "$lib/jwtUtils";
    import { io } from "socket.io-client";
    import { GetOneUser } from "$lib/userUtils";
    import { AuthGuard } from "$lib/AuthGuard";

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
					await axios.post("http://localhost:4000/auth/signin", {
						id: res.data.id,
						email: res.data.email,
						login: res.data.login,
						first_name: res.data.first_name,
						last_name: res.data.last_name,
						img_link: res.data.image.link,
					})
					.then(async (res) => {
						setJwt(res.data.access_token);
						await AuthGuard()
						.then((res) => {
							const user = res.data;
							if (user.twoFaEnabled) {
								goto("/login2fa")
							} else {
								io('http://localhost:4000', {
									path: "/event_user",
									query : { token : getJwt()}
								});
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
</script>
<div>
	login
	<br>
	<a href="https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-30852b8b9a7314be3ebf1c95396eaf181b1395e1320bd92b2dc092f4ffbb8aa6&redirect_uri=http%3A%2F%2Flocalhost%3A5173%2Flogin&response_type=code">
		Se connecter
	</a>
</div>