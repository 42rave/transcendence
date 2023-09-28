import { IsNumber, IsString, IsNotEmpty, IsOptional, IsEnum, NotEquals, Equals, ValidateIf } from 'class-validator';

import { ChannelKind } from '@prisma/client';

export class DirectChannelDto {
	@IsNotEmpty()
	@IsNumber()
	firstId: number;

	@IsNotEmpty()
	@IsNumber()
	secondId: number;

	@IsEnum(ChannelKind)
	@IsNotEmpty()
	@Equals(ChannelKind[ChannelKind.DIRECT])
	kind: ChannelKind;
	@IsString()
	@IsString()
	@IsOptional()
	socketId: string;
}

export class ChannelDto {
	@IsNumber()
	@IsNotEmpty()
	id: number;

	@IsString()
	@IsNotEmpty()
	name: string;

	@ValidateIf((o) => o.kind === ChannelKind.PROTECTED)
	@IsNotEmpty()
	password: string;

	@IsEnum(ChannelKind)
	@IsNotEmpty()
	@NotEquals(ChannelKind[ChannelKind.DIRECT])
	kind: ChannelKind;
	@IsString()
	@IsString()
	@IsOptional()
	socketId: string;
}

export class ChannelCreationDto {
	@IsString()
	@IsNotEmpty()
	name: string;

	@ValidateIf((o) => o.kind === ChannelKind.PROTECTED)
	@IsNotEmpty()
	password: string;

	@IsEnum(ChannelKind)
	@IsNotEmpty()
	@NotEquals(ChannelKind[ChannelKind.DIRECT])
	kind: ChannelKind;
}

export class ChannelPasswordDto {
	@IsString()
	password: string;
}
