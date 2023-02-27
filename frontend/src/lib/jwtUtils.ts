export const getJwt = () => {
	return window.localStorage.getItem('jwt') as string;
}

export const setJwt = (val : string) => {
	window.localStorage.setItem("jwt", val);
}

export const removeJwt = () => {
	window.localStorage.removeItem("jwt");
}