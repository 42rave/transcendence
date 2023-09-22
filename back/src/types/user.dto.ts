import { IsNumber, IsString, IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';

export class UserDto {
	@IsNumber()
	id: number;

	@IsString()
	@IsNotEmpty()
	username: string;

	@IsString()
	@IsNotEmpty()
	avatar: string;

	@IsString()
	@IsOptional()
	totpKey: string;

	@IsBoolean()
	twoFAEnabled: boolean;
}
