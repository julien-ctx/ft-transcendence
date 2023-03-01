<script lang="ts">
    import { myProfileDataStore } from '$lib/store/user';
    import { socketUserStore } from '$lib/store/socket';
	import { Navbar, NavBrand, NavLi, NavUl, NavHamburger, Avatar, Dropdown, DropdownItem, DropdownHeader, DropdownDivider } from 'flowbite-svelte'
	
	let user : any;
	let socketUser : any;
	let toggle : any;

	myProfileDataStore.subscribe(val => user = val);
	socketUserStore.subscribe(val => socketUser = val);

</script>

<!-- <Avatar id="user-drop" src={user.img_link} class="object-cover"/>
<Dropdown triggeredBy="#user-drop">
<DropdownHeader>
	<span class="block text-sm">{user.login}</span>
</DropdownHeader>
<DropdownItem href="/profile">Profile</DropdownItem>
<DropdownDivider />
<DropdownItem href="/logout" on:click={() => socketUser.emit("disconnect_user", user)}>Logout</DropdownItem>
</Dropdown> -->


<div class="avatar-section">
	<div class="flex items-center md:order-2">
		<Avatar id="avatar-menu" src={user.img_link} class="object-cover" size="lg"/>
		<NavHamburger on:click={toggle} class1="w-full md:flex md:w-auto md:order-1"/>
	</div>
	<Dropdown placement="bottom" triggeredBy="#avatar-menu" frameClass="dropdown-avatar">
		<DropdownHeader divClass="dropdown-header">
			<span class="login">{user.login}</span>
			<span class="email">{user.email}</span>
		</DropdownHeader>
		<DropdownItem defaultClass="dropdown-item" href="/profile">Profile</DropdownItem>
		<DropdownDivider />
		<DropdownItem defaultClass="dropdown-item" href="/logout" on:click={() => socketUser.emit("disconnect_user", user)}>Sign out</DropdownItem>
	</Dropdown>
</div>
