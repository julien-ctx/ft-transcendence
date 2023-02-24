import { getJwt } from "$lib/jwtUtils";
import { usersData } from "../store";
import axios from "axios"

export async function GetAllUsers() {
	return axios.get("http://localhost:4000/users/getAll", {
		headers: {
			Authorization : `Bearer ${getJwt()}`
		}
	});
}