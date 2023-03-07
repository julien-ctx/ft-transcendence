import { API_URL } from "$lib/env";
import { getJwt } from "$lib/jwtUtils";
import axios from "axios"

export async function AuthGuard() {	
	return await axios.get(`${API_URL}/users/me`, {
		headers: {
			Authorization : `Bearer ${getJwt()}`
		}
	});
}