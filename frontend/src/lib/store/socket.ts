import { writable } from "svelte/store";

export const socketUserStore = writable();

export const socketFriendStore = writable();

export const socketRoomStore = writable();

export const socketMpStore = writable();
