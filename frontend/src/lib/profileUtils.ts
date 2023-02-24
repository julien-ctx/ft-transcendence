import { getJwt } from "$lib/jwtUtils";
import { userData } from "../store";
import axios from "axios"

export async function UpdateProfileImg(formData : any) {
	return axios.post("http://localhost:4000/users/updateImg", formData, {headers : { Authorization : `Bearer ${getJwt()}` }});
}

export async function UpdateProfileLogin(login : any) {
	return axios.post("http://localhost:4000/users/updateLogin", {login}, {headers : { Authorization : `Bearer ${getJwt()}` }});
}

export function UpdateProfileToStore(params : any) {
	let tmp : any;
	tmp = params
	if (tmp.img_link.includes("/Users")) {
		const path = tmp.img_link.split("/");
		tmp.img_link = `/${path[path.length - 1]}`
	}
	userData.set(tmp);
}