import {
	IsNumber,
	IsString,
	IsNotEmpty,
	IsOptional,
	IsEnum,
	NotEquals,
	Equals,
	ValidateIf,
	Length
} from 'class-validator';

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
	@IsString()
	@Length(3, 32, { message: 'Password must be between 3 and 32 characters' })
	password: string;

	@IsEnum(ChannelKind)
	@IsNotEmpty()
	@NotEquals(ChannelKind[ChannelKind.DIRECT])
	kind: ChannelKind;

	@IsString()
	socketId: string;
}

export class ChannelCreationDto {
	@IsString()
	@IsNotEmpty()
	name: string;

	@IsOptional()
	@IsString()
	@Length(3, 32, { message: 'Password must be between 3 and 32 characters' })
	password: string;

	@IsEnum(ChannelKind)
	@IsNotEmpty()
	@NotEquals(ChannelKind[ChannelKind.DIRECT])
	kind: ChannelKind;
}

export class ChannelPasswordDto {
	@IsString()
	@IsOptional()
	@Length(3, 32, { message: 'Password must be between 3 and 32 characters' })
	password: string;

	@IsString()
	socketId: string;
}
