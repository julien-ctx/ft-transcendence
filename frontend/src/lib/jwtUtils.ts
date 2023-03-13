
export const getJwt = () => {
	return window.localStorage.getItem("jwt");
}

export const setJwt = (newJwt : string) => {
	window.localStorage.setItem("jwt", newJwt);
}

export const removeJwt = () => {
	window.localStorage.removeItem("jwt");
}