<style>
	.menubar {
		width: 100%;
		position: absolute;
		height: 10%;
		background-color: darkseagreen;
		display: flex;
		align-items: center;
	}

	.profile {
		clip-path: circle();
		background-color: black;
		width: 50px;
	}

	.image-button {
		display: inline-block;
		position: relative;
		margin: 10px;
		width: 40px; /* adjust to the size you want */
		height: 40px; /* adjust to the size you want */
		border: none;
		overflow: hidden;
		cursor: pointer;
		background-color: transparent;
	}

	.image-button img {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.3s;
	}

	.image-button:hover img {
		transform: scale(1.1);
	}

	.badge {
		position: absolute;
		top: 0px;
		right: 0px;
		background-color: red;
		color: white;
		/* border-radius: 50%; */
		clip-path: circle();
		padding: 5px;
		font-size: 12px;
	}

	.notification-container {
		position: relative;
		display: inline-block;
	}
</style>

<script lang="ts">
	import { goto } from '$app/navigation';


	function test() {
		console.log("test");
	}
</script>



<div class="menubar">
	<button class="image-button" on:click={() => test()}>
		<img src="/lunes.png" alt="darkmode">
	</button>
	<button class="image-button" on:click={() => test()}>
		<img src="/reglages.png" alt="settings">
	</button>
	<div class="notification-container">
		<button class="image-button" on:click={() => test()}>
			<img src="/notification.png" alt="notif">
			<span class="badge">3</span>
		</button>
	</div>
	<div class="profile">
		<img src="https://cdn.pixabay.com/photo/2015/03/04/22/35/head-659651_960_720.png" alt="profile" />
	</div>
	<div>
		<button on:click={() => goto('/chat')}>Chat</button>
	</div>
</div>

