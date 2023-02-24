import { writable } from "svelte/store";

export const profileDataStore = writable({});

export const usersDataStore = writable([{}]);

export const userProfileStore = writable({});

export const searchInputStore = writable("");

export const usersComponentStore = writable([]);