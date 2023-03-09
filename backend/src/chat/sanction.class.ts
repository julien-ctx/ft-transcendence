import { PrismaService } from 'src/prisma/prisma.service';
import { RoomClass } from './room.interface';

export class Sanction {
    room : string;
    sanction : string;
    time : string;
    duration : string;
    member : any;
    endOfSanction : Date;
    db : PrismaService;
    Clients : any;
    Rooms : any;


    constructor (Rooms : any, Client : any, obg : any, private prisma : PrismaService) {
        this.sanction = obg.sanction;
        this.time = obg.time;
        this.duration = obg.duration;
        this.member = obg.member;
        this.room = obg.roomName;
        this.db = prisma;
        this.Clients = Client;
        this.Rooms = Rooms;
    }

    setEndOfSanction() {
        let now = new Date();
        console.log(now);
        console.log('-> Arg time : ', this.time, this.duration);
        if (this.time === '' || this.duration === '') 
            return null;
        switch (this.duration) {
            case 'Second':
                now.setSeconds(now.getSeconds() + +parseInt(this.time));
            case 'Minutes':
                now.setMinutes(now.getMinutes() + +parseInt(this.time));
            case 'Hour':
                now.setHours(now.getHours() + +parseInt(this.time));
            case 'Day':
                now.setDate(now.getDate() + +parseInt(this.time));
            case 'Month':
                now.setMonth(now.getMonth() + +parseInt(this.time));
        }
        this.endOfSanction = now;
        console.log(now);
    }

    async handleSanction() {
        this.setEndOfSanction();
        // console.log(this.sanction);
        switch (this.sanction) {
            case 'ban': 
                await this.ban();
            case 'mute':
                await this.mute();
            case 'kick':
                await this.kick();
        }
    }

    async ban() {
        console.log('ban');
        // Delete relation
        const User = await this.db.user.findUnique({
            where: {
                id_user : this.member.id_user
            }
        });
        const Room  = await this.db.room.findUnique({
            where: {
                name: this.room
            }
        });
        const relation = await this.prisma.roomToUser.findMany({
			where: {
				id_user: User.id_user,
				id_room: Room.id,
			}
		});
        await this.prisma.roomToUser.delete({
            where: {
                id: relation[0].id,
            }
        });
        // Create Ban model
        console.log(this.endOfSanction);
        // await this.prisma.banned.create({
        //     data : {
        //         id_user: User.id_user,
        //         id_room: Room.id,
        //         endBan : this.endOfSanction,
        //     }
        // });
        // console.log(this.Clients)
        // for (let i = 0; i < this.Clients.length; i++) {
        //     console.log(this.Clients[i].user);
        //     if (this.Clients[i].user.login === User.login) {
        //         this.Clients[i].client.emit('deletedRoom', Room.name);
        //     }
        // }
    }

    async mute() {
        // Set mute to true

        // Set the endMutetime
    }

    async kick() {
        // Delete relation
        // const User = await this.db.user.findUnique({
        //     where: {
        //         login: this.member
        //     }
        // });
        // const Room  = await this.db.room.findUnique({
        //     where: {
        //         name: this.room
        //     }
        // });
        // const relation = await this.prisma.roomToUser.findMany({
		// 	where: {
		// 		id_user: User.id_user,
		// 		id_room: Room.id,
		// 	}
		// });
        // await this.prisma.roomToUser.delete({
        //     where: {
        //         id: relation[0].id,
        //     }
        // });
        // 
    }

    findRoom(roomName : string) {
        return this.Rooms.find((elem) => elem.Room.name === roomName);
    }
}