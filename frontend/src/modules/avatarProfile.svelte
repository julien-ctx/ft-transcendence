<script lang="ts">
	import {Avatar, Dropdown, DropdownHeader, DropdownItem, DropdownDivider} from 'flowbite-svelte'
    import { profileDataStore } from '../store';
	
	let user : any;

	profileDataStore.subscribe(val => {
		user = val;
	});
</script>

<Avatar id="user-drop" src={user.img_link} />
<Dropdown triggeredBy="#user-drop">
<DropdownHeader>
	<span class="block text-sm">{user.login}</span>
</DropdownHeader>
<DropdownItem href="/profile">Profile</DropdownItem>
<DropdownDivider />
<DropdownItem href="/logout">Logout</DropdownItem>
</Dropdown>