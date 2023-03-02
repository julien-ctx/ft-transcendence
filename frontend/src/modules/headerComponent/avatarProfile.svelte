<script lang="ts">
    import { myProfileDataStore } from '$lib/store/user';
    import { socketUserStore } from '$lib/store/socket';
	import { NavHamburger, Avatar, Dropdown, DropdownItem, DropdownHeader, DropdownDivider } from 'flowbite-svelte'
	
	let user : any;
	let socketUser : any;

	myProfileDataStore.subscribe(val => user = val);
	socketUserStore.subscribe(val => socketUser = val);

</script>

<div class="">
	<div class="flex items-center md:order-2">
		<Avatar id="avatar-menu" src={user.img_link} class="object-cover cursor-pointer"/>
	</div>
	<Dropdown placement="bottom" triggeredBy="#avatar-menu">
		<DropdownHeader>
			<span class="login">{user.login}</span>
		</DropdownHeader>
		<DropdownItem href="/profile">Profile</DropdownItem>
		<DropdownDivider />
		<DropdownItem  href="/logout" on:click={() => socketUser.emit("disconnect_user", user)}>Sign out</DropdownItem>
	</Dropdown>
</div>
