export class RoomClass {

	ClientUser : any[];
	roomName : string;

	constructor(User : any, Client : any, room : string) {
		this.ClientUser = [{User, Client}];
		this.roomName = room;
	}

	isHere(User : any) {
		// return this.ClientUser.find((client) => client.User === User);
		let isHere = false;
		this.ClientUser.forEach((client) => {
			if (client.User.id_user === User.id_user)
				isHere = true;
		});
		return isHere;
	}

	deleteUser(User : any) {
		this.ClientUser.forEach((client) => {
			if (client.User.id_user === User.id_user)
				this.ClientUser.splice(this.ClientUser.indexOf(client), 1);
		})
	}

	addUser(User : any, Client : any) {
		this.ClientUser.push({User, Client});
	}

	removeUser(User : any) {
		if (this.isHere(User)) {
			this.deleteUser(User);
		}
	}

	changeClient(User : any, Client : any) {
		this.ClientUser.forEach((client) => {
			if (client.User.id_user === User.id_user)
				client.Client = Client;
		});
	}

	findClient(User : any) {
		let client = null;
		this.ClientUser.forEach((client) => {
			if (client.User.id_user === User.id_user)
				client = client.Client;
		});
		return client;
	}
}