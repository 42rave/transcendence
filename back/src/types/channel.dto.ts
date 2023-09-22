import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

import { ChannelKind } from '@prisma/client';

export class ChannelDto {
	@IsString()
	@IsOptional()
	password: string;

	@IsString()
	@IsOptional()
	socketId: string;
}

export class ChannelCreationDto {
	@IsString()
	@IsNotEmpty()
	name: string;

	@IsString()
	@IsOptional()
	password: string;

	@IsEnum(ChannelKind)
	@IsNotEmpty()
	kind: ChannelKind;
}
