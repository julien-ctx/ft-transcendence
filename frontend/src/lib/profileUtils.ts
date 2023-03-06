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
	let count : number = 0;
	if (params.notification) {
		params.notification.forEach((elem : any) => {
			if (!elem.is_read)
				count++;
		});
	}
	// if (params.picture_user) {
	// 	console.log(params);
		
	// 	params.img_link = `data:${params.picture_user.mimetype};base64,${btoa(String.fromCharCode(...params.picture_user.byte.data))}`
	// }
	myProfileDataStore.set(params);
	myNotifLength.set(count);
}

export async function UpdateProfileConnected(activity : number) {
	return await axios.post("http://localhost:4000/users/updateConnected", {activity}, {headers : { Authorization : `Bearer ${getJwt()}` }});
}