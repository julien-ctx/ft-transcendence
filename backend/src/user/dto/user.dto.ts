import { IsBoolean, IsNotEmpty, IsNumber, IsString } from "class-validator"

export class UserDto {

	@IsNotEmpty()
	@IsString()
	createdAt : string

	@IsNotEmpty()
	@IsString()
	email : string

	@IsNotEmpty()
	@IsString()
	first_name : string

	@IsNotEmpty()
	@IsNumber()
	id: 16
	
	@IsNotEmpty()
	@IsNumber()
	id_user: 129308

	@IsNotEmpty()
	@IsString()
	img_link : string

	@IsNotEmpty()
	@IsString()
	last_name : string

	@IsNotEmpty()
	@IsString()
	login : string

	@IsBoolean()
	connected : boolean

	friend_id : number[]

	notif_friend : []
}