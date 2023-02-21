export const getJwt = () => {
	return localStorage.getItem('jwt') as string;
}

export const setJwt = (val : string) => {
	localStorage.setItem("jwt", val);
}

export const removeJwt = () => {
	localStorage.removeItem("jwt");
}