import { IsNumber, IsString, IsNotEmpty } from 'class-validator';

export class UserDto {
	@IsNumber()
	id: number;

	@IsString()
	@IsNotEmpty()
	username: string;

	@IsString()
	@IsNotEmpty()
	avatar: string;
}
