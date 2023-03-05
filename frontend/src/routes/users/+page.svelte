<script lang="ts">
    import { usersDataStore } from '$lib/store/user';
    import UserCard from "../../modules/htmlComponent/userCard.svelte";
    import HeaderUserCard from "../../modules/htmlComponent/headerUserCard.svelte";


	let allUsers : any = [];
	let usersComponent : any = [];
	let searchInput : string = "";
	let selectFilter : string = "activity";
	let selectOrder : string = "desc";

	usersDataStore.subscribe(val => allUsers = val);
	usersDataStore.subscribe(val => usersComponent = val);
	updateUserComponent();

	function handleChangeSearch() {
		if (searchInput !== "") {
			usersComponent = [];
			if (allUsers) {
				for (let i = 0; i < allUsers.length; i++) {
					if (allUsers[i].login) {
						const toComp = allUsers[i].login.substr(0, searchInput.length);
						if (toComp === searchInput) {
							if (!usersComponent.includes(allUsers[i])) {
								usersComponent.push(allUsers[i]);
							}
						}
						else if (usersComponent.includes(allUsers[i])){
							usersComponent.splice(i, 1);
						}
					}
				}
			}
		} else
			usersComponent = allUsers;
		if (selectOrder != "no")
			updateUserComponent();
		else
			usersComponent = usersComponent;
	}

	function compare(a : any, b : any) {
		let aObj : any;
		let bObj : any;
		switch(selectFilter) {
			case "activity":
				aObj = a.activity;
				bObj = b.activity;
				break;
			case "winrate":
				aObj = a.winrate;
				bObj = b.winrate;
				break;
			case "ranking":
				aObj = a.ranking;
				bObj = b.ranking;
				break;
			case "level":
				aObj = a.level;
				bObj = b.level;
				break;
			default:
				break;
		}
		if (selectOrder == "asc") {
			if (aObj < bObj)
				return -1;
			else if (aObj > bObj)
				return 1;
		} else {
			if (aObj > bObj)
				return -1;
			else if (aObj < bObj)
				return 1;
		}
		return 0;
	}

	function updateUserComponent() {
		usersComponent.sort(compare);
		usersComponent = usersComponent;
	}

</script>

<div class="p-10 container mx-auto gap-10 max-w-screen-xl">
	<div class="grid grid-cols-1 md:grid-cols-6 gap-10 content-search-users">
		<div class="flex flex-col justify-between">
			<label for="search">Search an user :</label>
			<input class="focus:outline-none focus:ring-0" id="search" placeholder="Search by nickname" bind:value={searchInput} on:input={handleChangeSearch}/>
		</div>
		<div class="flex flex-col justify-between">
			<label for="filter">Filter :</label>
			<select class="focus:outline-none focus-visible:ring-transparent focus:ring-transparent" id="filter" bind:value={selectFilter} on:change={updateUserComponent}>
				<option value="activity">Activity</option>
				<option value="winrate">Win rate</option>
				<option value="ranking">Ranking</option>
				<option value="level">Level</option>
			</select>
		</div>
		<div class="flex flex-col justify-between">
			<label for="order">Order :</label>
			<select  class="focus:outline-none focus-visible:ring-transparent focus:ring-transparent" id="order" bind:value={selectOrder} on:change={updateUserComponent}>
				<option value="desc">Descending</option>
				<option value="asc">Ascending</option>
			</select>
		</div>
	</div>

	<div class="flex flex-col gap-5 mt-10">
		<HeaderUserCard />
		{#each usersComponent as user}
			{#if user.login != undefined}
				<UserCard user={user}/>
			{/if}
		{/each}
	</div>
</div>