export class RoomClass {

	ClientUser : any[];
	roomName : string;

	constructor(User : any, Client : any, room : string) {
		this.ClientUser = [{User, Client}];
		this.roomName = room;
	}

	isHere(User : any) {
		return this.ClientUser.find((client) => client.User === User);
	}

	deleteUser(User : any) {
		this.ClientUser = this.ClientUser.filter((client) => client.User !== User);
	}

	addUser(User : any, Client : any) {
		this.ClientUser.push({User, Client});
	}
}