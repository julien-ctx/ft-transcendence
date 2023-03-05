<script lang="ts">
    import { getJwt } from "$lib/jwtUtils";
    import axios from "axios";
    import { Button } from "flowbite-svelte";

	const fakeUser = [
		{
			id_user : 1,
			email : "john@fake.com",
			login: "jdoe",
			first_name: "jhon",
			last_name: "doe",
			img_link: "",
			activity: 0,
			level : 5,
			winrate : 69.99,
			exp : 1200,
			ranking: 2
		},
		{
			id_user : 2,
			email : "scott@fake.com",
			login: "sdoe",
			first_name: "scott",
			last_name: "doe",
			img_link: "",
			activity: 0,
			level : 4,
			winrate : 84.99,
			exp : 1944,
			ranking: 2
		},
		{
			id_user : 3,
			email : "zoe@fake.com",
			login: "zdoe",
			first_name: "zoe",
			last_name: "doe",
			img_link: "",
			activity: 1,
			level : 5,
			winrate : 89.99,
			exp : 1200,
			ranking: 2
		},
		{
			id_user : 4,
			email : "camille@fake.com",
			login: "cdoe",
			first_name: "camille",
			last_name: "doe",
			img_link: "",
			activity: 2,
			level : 4,
			winrate : 59.5,
			exp : 900,
			ranking: 2
		},
		{
			id_user : 5,
			email : "barbara@fake.com",
			login: "badoe",
			first_name: "barbara",
			last_name: "doe",
			img_link: "",
			activity: 1,
			level : 1,
			winrate : 0,
			exp : 300,
			ranking: 1
		},
		{
			id_user : 6,
			email : "huge@fake.com",
			login: "hdoe",
			first_name: "huge",
			last_name: "doe",
			img_link: "",
			activity: 0,
			level : 0,
			winrate : 9.5,
			exp : 0,
			ranking: 0
		},
		{
			id_user : 7,
			email : "jean@fake.com",
			login: "jedoe",
			first_name: "jean",
			last_name: "doe",
			img_link: "",
			activity: 0,
			level : 3,
			winrate : 9.5,
			exp : 600,
			ranking: 1
		},
		{
			id_user : 8,
			email : "alfonse@fake.com",
			login: "adoe",
			first_name: "alfonse",
			last_name: "doe",
			img_link: "",
			activity: 0,
			level : 0,
			winrate : 9.5,
			exp : 100,
			ranking: 0
		},
		{
			id_user : 9,
			email : "bernard@fake.com",
			login: "bdoe",
			first_name: "bernard",
			last_name: "doe",
			img_link: "",
			activity: 0,
			level : 5,
			winrate : 89.99,
			exp : 1200,
			ranking: 2
		},
		{
			id_user : 10,
			email : "elvis@fake.com",
			login: "edoe",
			first_name: "elvis",
			last_name: "doe",
			img_link: "",
			activity: 0,
			level : 0,
			winrate : 14,
			exp : 100,
			ranking: 0
		}
	]
	async function handleClick() {
		console.log(fakeUser);
		await axios.post("http://localhost:4000/users/fakeUser", fakeUser, {headers : { Authorization : `Bearer ${getJwt()}` }})
		.then((res) => {
			console.log(res);
			
		})
	}
</script>

<Button on:click={handleClick}>Add fake user</Button>