import { getJwt } from "$lib/jwtUtils";
import { myNotifLength, myProfileDataStore } from "$lib/store/user";
import axios from "axios"

export async function UpdateProfileImg(formData : any) {
	return await axios.post("http://localhost:4000/users/updateImg", formData, {headers : { Authorization : `Bearer ${getJwt()}` }});
}

export async function UpdateProfileLogin(login : any) {
	return await axios.post("http://localhost:4000/users/updateLogin", {login}, {headers : { Authorization : `Bearer ${getJwt()}` }});
}

export function UpdateProfileToStore(params : any) {
	myProfileDataStore.set(params);
	let count : number = 0;
	if (params.notification) {
		params.notification.forEach((elem : any) => {
			if (!elem.is_read)
				count++;
		});
	}
	myNotifLength.set(count)
}

export async function UpdateProfileConnected(connected : boolean) {
	return await axios.post("http://localhost:4000/users/updateConnected", {connected}, {headers : { Authorization : `Bearer ${getJwt()}` }});
}