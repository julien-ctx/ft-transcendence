import { getJwt } from "$lib/jwtUtils";
import axios from "axios"

export async function GetAllUsers() {
	return await axios.get("http://localhost:4000/users/getAll", {
		headers: {
			Authorization : `Bearer ${getJwt()}`
		}
	});
}

export async function GetOneUser(id : string) {
	return await axios.get(`http://localhost:4000/users/${id}`, {
		headers: {
			Authorization : `Bearer ${getJwt()}`
		}
	});
}