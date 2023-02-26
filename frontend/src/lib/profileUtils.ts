import { getJwt } from "$lib/jwtUtils";
import { myNotifLength, myProfileDataStore } from "../store";
import axios from "axios"

export async function UpdateProfileImg(formData : any) {
	return axios.post("http://localhost:4000/users/updateImg", formData, {headers : { Authorization : `Bearer ${getJwt()}` }});
}

export async function UpdateProfileLogin(login : any) {
	return axios.post("http://localhost:4000/users/updateLogin", {login}, {headers : { Authorization : `Bearer ${getJwt()}` }});
}

export function UpdateProfileToStore(params : any) {
	myProfileDataStore.set(params);
	if (params.notif_friend)
		myNotifLength.set(params.notif_friend.length as number)
}

export function UpdateProfileConnected(connected : boolean) {
	return axios.post("http://localhost:4000/users/updateConnected", {connected}, {headers : { Authorization : `Bearer ${getJwt()}` }});
}