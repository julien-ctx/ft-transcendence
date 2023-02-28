import { writable } from "svelte/store";

export const myProfileDataStore = writable({});

export const usersDataStore = writable([{}]);

export const usersHimSelfDataStore = writable({});

export const userProfileDataStore = writable({});

export const myNotificationsDataStore = writable([]);

export const myNotifLength = writable();
