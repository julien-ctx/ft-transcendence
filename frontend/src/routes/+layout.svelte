<script lang="ts">
	import "../app.scss";
    import "../app.postcss";
    import { page } from '$app/stores';
    import { onMount } from "svelte";
    import { io } from "socket.io-client";
    import { UpdateProfileToStore } from "$lib/profileUtils";
    import { getJwt, removeJwt } from "$lib/jwtUtils";
    import { myProfileDataStore, userProfileDataStore, usersDataStore } from "$lib/store/user";
    import { socketFriendStore, socketUserStore } from "$lib/store/socket";
    import { GetAllUsers } from "$lib/userUtils";
    import { AuthGuard } from "$lib/AuthGuard";
    import { goto } from "$app/navigation";
    import Header from "./Header.svelte";

    let allUsers : any;
    let userProfile : any;
    let myProfile : any;

    userProfileDataStore.subscribe(val => userProfile = val);
    usersDataStore.subscribe(val => allUsers = val);
    myProfileDataStore.subscribe(val => myProfile = val);

    onMount(async () => {		
		if (getJwt() != undefined) {
			await AuthGuard()
			.then((res) => {
				UpdateProfileToStore(res.data);
				console.log(myProfile);
						
			})
			.catch((err) => {
				if (err.response.status == 401) {
					removeJwt();
					goto("/login")
				}
			})
			await GetAllUsers()
			.then((res) => {
				usersDataStore.set(res.data);
			})
			let socketUser = io('http://localhost:4000', {
				path: "/event_user",
				query : { token : getJwt()}
			});
			socketUser.on("update_me", (data : any) => {
				UpdateProfileToStore(data);
			})
			socketUser.on("event_user", (data : any) => {
				// console.log("data", data, "userprofile", userProfile, "alluser", allUsers);
				if (data.id && userProfile.id && data.id == userProfile.id)
					userProfileDataStore.set(data);
				if (allUsers && allUsers.length != 0) {
					let arrId : number [] = [];
					for (let i = 0; i < allUsers.length; i++) {
						if (allUsers[i].id == data.id) {
							allUsers[i] = data;
							usersDataStore.set(allUsers)
							arrId.push(data.id);
						}
					}
					if (!arrId.includes(data.id) && data.id != myProfile.id) {
						allUsers.push(data)
						usersDataStore.set(allUsers);
					}
				}
			})
			socketUserStore.set(socketUser);

			let socketFriend = io('http://localhost:4000', {
				path: "/notif_friend",
				query : { token : getJwt()}
			});
			socketFriend.on('event_friend', (data : any) => {
				UpdateProfileToStore(data);			
			});
			socketFriendStore.set(socketFriend);
		} else {
			goto("/login")
		}
	})
</script> 

<div class="container mx-auto h-screen">
	{#if $page.url.pathname != "/login"}
		<Header />
	{/if}
	<main class="h-full">
		<slot></slot>
	</main>
</div>

<style>
	/* .app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	} */

	/* main {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 1rem;
		width: 100%;
		max-width: 64rem;
		margin: 0 auto;
		box-sizing: border-box;
	} */

	/* footer {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 12px;
	}

	footer a {
		font-weight: bold;
	}

	@media (min-width: 480px) {
		footer {
			padding: 12px 0;
		}
	} */
</style>
