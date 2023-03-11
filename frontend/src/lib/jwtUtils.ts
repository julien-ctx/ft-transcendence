
export const getJwt = () => {
	let cookies : any = [];

	document.cookie.split(";").forEach(cookie => {
		const [name, value] = cookie.split("=");
		cookies.push({ name: name, value: value });
	});
	for (let i = 0; i < cookies.length; i++) {
		if (cookies[i].name == "jwt")
			return cookies[i].value;
	}
}

export const setJwt = (newJwt : string) => {
	window.document.cookie = `jwt= ${newJwt};`;
}

export const removeJwt = () => {
	window.document.cookie = "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}