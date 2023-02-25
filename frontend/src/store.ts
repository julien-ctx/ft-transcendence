import { writable } from "svelte/store";

export const myProfileDataStore = writable({});

export const usersDataStore = writable([{}]);

export const userProfileDataStore = writable({});

export const searchInputStore = writable("");

export const usersComponentStore = writable([]);

export const myNotificationsDataStore = writable([]);