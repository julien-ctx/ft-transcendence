import { getJwt } from "$lib/jwtUtils";
import axios from "axios"

export async function UpdateProfileImg(formData : any) {
	return axios.post("http://localhost:4000/users/updateImg", formData, {headers : { Authorization : `Bearer ${getJwt()}` }});
}

export async function UpdateProfileLogin(login : any) {
	return axios.post("http://localhost:4000/users/updateLogin", {login}, {headers : { Authorization : `Bearer ${getJwt()}` }});
}