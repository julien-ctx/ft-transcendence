import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { UserDto } from "./dto/user.dto";

@Injectable()
export class UserService {
	constructor(private prisma : PrismaService) {}

	async updateMe(params : any , id : number) {
		return this.prisma.user.update({
			where: {
				id
			},
			data : {
				...params
			}
		});
	}

	async getOne(id : number) {
		return this.prisma.user.findUnique({
			where: {
				id
			}
		});
	}

	async getAll(id : number) {
		return this.prisma.user.findMany({
			where: {
				id : {
					not: id
				}
			}
		});
	}
}