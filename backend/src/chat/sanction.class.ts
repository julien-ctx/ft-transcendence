import { PrismaService } from 'src/prisma/prisma.service';

export class Sanction {
    room : string;
    sanction : string;
    time : string;
    duration : string;
    member : string;
    endOfSanction : Date;
    db : PrismaService;

    constructor (obg : any, private prisma : PrismaService) {
        this.sanction = obg.sanction;
        this.time = obg.time;
        this.duration = obg.duration;
        this.member = obg.member;
        this.room = obg.roomName;
        this.db = prisma;
    }

    setEndOfSanction() {
        let now = new Date();
        console.log(now);
        console.log(this.time, this.duration);
        if (this.time === '' || this.duration === '') 
            return null;
        switch (this.duration) {
            case 'Day':
                now.setDate(now.getDate() + +parseInt(this.time));
            case 'Second':
                now.setSeconds(now.getSeconds() + +parseInt(this.time));
            case 'Month':
                now.setMonth(now.getMonth() + +parseInt(this.time));
        }
        this.endOfSanction = now;
        console.log(now);
    }

    async handleSanction() {
        this.setEndOfSanction();
        switch (this.sanction) {
            case 'Ban': 
                await this.ban();
            case 'Mute':
                await this.mute();
            case 'Kick':
                await this.kick();
        }
    }

    async ban() {
        
    }

    async mute() {

    }

    async kick() {

    }
}