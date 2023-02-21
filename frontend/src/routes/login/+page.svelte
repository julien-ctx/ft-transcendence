<svelte:head>
	<title>Login</title>
	<meta name="description" content="About this app" />
</svelte:head>

<script>
    import { onMount } from "svelte";
	import axios from "axios";

	onMount(async () => {
		const urlParams = new URLSearchParams(window.location.search);
		const hasCode = urlParams.has("code");
		if (hasCode) {
			const code = urlParams.get("code");
			await axios.post("https://api.intra.42.fr/oauth/token", {
				grant_type : "authorization_code",
				client_id : "u-s4t2ud-30852b8b9a7314be3ebf1c95396eaf181b1395e1320bd92b2dc092f4ffbb8aa6",
				client_secret : "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",
				code : code,
				redirect_uri : "http://localhost:5173/login",
			})
			.then((res) => {
				axios.get("https://api.intra.42.fr/v2/me", { 
					headers : 
					{
						Authorization: `Bearer ${res.data.access_token}`
					}
				})
				.then((res) => {
					axios.post("http://localhost:4000/auth/signin", {
						id: res.data.id,
						email: res.data.email,
						login: res.data.login,
						first_name: res.data.first_name,
						last_name: res.data.last_name,
						img_link: res.data.image.link
					})
					.then((res) => {
						window.localStorage.setItem("jwt", res.data.access_token);
						// window.location.href("/")
						console.log(res.data);
					})
					.catch((err) => console.log(err))
				})
				.catch((err) => console.log(err))
			})
			.catch((err) => console.log(err));
		}
	})
</script>

<section>
	login
</section>