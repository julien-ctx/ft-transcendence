import { getJwt } from "$lib/jwtUtils";
import axios from "axios"
import { API_URL } from "./env";

export async function GetAllUsers() {
	return await axios.get(`${API_URL}/users/getAll`, {
		headers: {
			Authorization : `Bearer ${getJwt()}`
		}
	});
}

export async function GetOneUser(id : string) {
	return await axios.get(`${API_URL}/users/${id}`, {
		headers: {
			Authorization : `Bearer ${getJwt()}`
		}
	});
}