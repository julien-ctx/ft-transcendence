import { getJwt } from "$lib/jwtUtils";
import axios from "axios"

export async function AuthGuard() {	
	return await axios.get("http://localhost:4000/users/me", {
		headers: {
			Authorization : `Bearer ${getJwt()}`
		}
	});
}