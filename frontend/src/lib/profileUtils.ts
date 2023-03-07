import { getJwt } from "$lib/jwtUtils";
import { myNotifLength, myProfileDataStore } from "$lib/store/user";
import axios from "axios"
import { API_URL } from "./env";

export async function UpdateProfileImg(formData : any) {
	return await axios.post(`${API_URL}/users/updateImg`, formData, {headers : { Authorization : `Bearer ${getJwt()}` }});
}

export async function UpdateProfileLogin(login : any) {
	return await axios.post(`${API_URL}/users/updateLogin`, {login}, {headers : { Authorization : `Bearer ${getJwt()}` }});
}

export function UpdateProfileToStore(params : any) {
	let count : number = 0;
	if (params.notification) {
		params.notification.forEach((elem : any) => {
			if (!elem.is_read)
				count++;
		});
	}
	myProfileDataStore.set(params);
	myNotifLength.set(count);
}

export async function UpdateProfileConnected(activity : number) {
	return await axios.post(`${API_URL}/users/updateConnected`, {activity}, {headers : { Authorization : `Bearer ${getJwt()}` }});
}