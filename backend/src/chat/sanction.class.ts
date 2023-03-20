import { PrismaService } from 'src/prisma/prisma.service';

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
    By : any;

    constructor (Rooms : any, Client : any, obg : any, private prisma : PrismaService, client : any) {
        this.sanction = obg.sanction;
        this.time = obg.time;
        this.duration = obg.duration;
        this.member = obg.member;
        this.room = obg.roomName;
        this.db = prisma;
        this.Clients = Client;
        this.Rooms = Rooms;
        this.By = client;
    }

    setEndOfSanction() {
        let now = new Date();
        if (this.time === '' || this.duration === '') 
            return false;
        switch (this.duration) {
            case 'Second':
                now.setSeconds(now.getSeconds() + parseInt(this.time)); break;
            case 'Minutes':
                now.setMinutes(now.getMinutes() + parseInt(this.time)); break;
            case 'Hour':
                now.setHours(now.getHours() + parseInt(this.time)); break;
            case 'Day':
                now.setDate(now.getDate() + parseInt(this.time)); break;
            case 'Month':
                now.setMonth(now.getMonth() + parseInt(this.time)); break;
            default: 
                break;
        }
        this.endOfSanction = now;
        return true;
    }

    async handleSanction() {
        if (this.sanction !== 'kick')
            if (this.setEndOfSanction() === false) return;
        switch (this.sanction) {
            case 'ban': 
                await this.ban(); break;
            case 'kick':
                await this.kick(); break;
            default:
                break;
        }
    }

    async ban() {
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
        if (relation === undefined) // user is not in the channel
            return ;
        await this.prisma.roomToUser.delete({
            where: {
                id: relation[0].id,
            }
        });

        // Create Ban model
        await this.prisma.banned.create({
            data : {
                id_user: User.id_user,
                id_room: Room.id,
                endBan : this.endOfSanction,
            }
        });
        this.Clients.forEach((elem : any) => {
            if (elem.user.id === this.member.id_user) 
                elem.client.emit('deletedRoom', Room.name);
            elem.client.emit('deletedMember', this.member)
        });
    }

    // Same as ban but without the creation of the ban model
    async kick() {
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
        if (relation[0] === undefined) // user is not in the channel
            return ;
        await this.prisma.roomToUser.delete({
            where: {
                id: relation[0].id,
            }
        });
        this.Clients.forEach((elem : any) => {
            if (elem.user === null) return ;
            if (elem.user?.id === this.member.id_user) {
                elem.client.emit('deletedRoom', Room.name);
                if (Room.status === 'Public')
                    elem.client.emit('newPublicRoom', Room);
            }
            elem.client.emit('deletedMember', this.member)
        });
    }

    findRoom(roomName : string) {
        return this.Rooms.find((elem) => elem.Room.name === roomName);
    }
}