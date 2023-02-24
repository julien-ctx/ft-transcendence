<script lang="ts">
    import { UpdateProfileImg, UpdateProfileLogin, UpdateProfileToStore } from "$lib/profileUtils";
	import { Avatar, Card, Dropdown, DropdownItem, MenuButton } from "flowbite-svelte";
    import { userData } from "../../store";

	let fileInput : any;
	let isEditLogin : boolean = false;
	let user : any;

	userData.subscribe(val => {
		user = val;
	})

	async function submitFormImg() {
		const formData = new FormData();
		formData.append('file', fileInput.files[0]);
		UpdateProfileImg(formData)
		.then((res) => {
			UpdateProfileToStore(res.data);
		})
		.catch((err) => console.log(err));
	}

	async function submitFormLogin() {
		UpdateProfileLogin(user.login)
		.then((res) => {
			UpdateProfileToStore(res.data);
			isEditLogin = false;
		})
		.catch((err) => console.log(err));
	}
</script>

{#if user.login}
	<div class="container mx-auto flex items-center flex-col">
		<Card padding="sm" size="md">
			<div class="flex items-center space-x-4">
				<div class="flex">
					<Avatar size="xl" src={user.img_link}/>
					<MenuButton/>
					<Dropdown>
						<DropdownItem defaultClass="flex">
							<label for="file" class="w-full cursor-pointer p-1">
								Edit
								<input type="file" bind:this={fileInput} on:change={submitFormImg} class="hidden" name="file" id="file">
							</label>
						</DropdownItem>
					</Dropdown>
				</div>
				<div class="space-y-1 font-medium dark:text-white">
					<div class="flex">
						{#if !isEditLogin}
							<div>{user.login}</div>
							<button on:click={() => isEditLogin = true}><img src="/stylo-modifier.png" alt=""></button>
						{:else}
							<input type="text" bind:value={user.login}>
							<button on:click={() => isEditLogin = false}><img src="/signe-de-la-croix.png" alt="" width="24"></button>
							<button on:click={submitFormLogin}><img src="/check.png" alt="" width="24"></button>
						{/if}
					</div>
					<div>Firstname: {user.first_name}</div>
					<div>Lastname: {user.last_name}</div>
					<div>Email: {user.email}</div>
				</div>
			</div>
		</Card>
	</div>

{/if}