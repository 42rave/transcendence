import { IsNumber, IsString, IsNotEmpty, Length, Matches } from 'class-validator';

export class UsernameDto {
	@IsNotEmpty({ message: 'Username is required' })
	@IsString({ message: 'Username must be a string' })
	@Length(3, 32, { message: 'Username must be between 3 and 32 characters' })
	@Matches(/^[a-zA-Z0-9_\-]+$/, { message: 'Username must only contain alphanumeric characters and underscores' })
	username: string;
}
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

export class SingleTargetDto {
	@IsNumber()
	targetUserId: number;
}
