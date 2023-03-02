import { IsBoolean, IsNumber, IsString } from "class-validator";

export class AuthDto {
	@IsNumber()
	id : number;

	@IsString()
	email : string;

	@IsString()
	login : string;

	@IsString()
	first_name : string;

	@IsString()
	last_name : string;
	
	@IsString()
	img_link : string;

	@IsString()
	kind : string;
}