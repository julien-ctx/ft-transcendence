import { writable } from 'svelte/store';

export const isLogged = writable(false);
export const jwtToken = writable(null);