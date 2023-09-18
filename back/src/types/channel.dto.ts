import {
	IsNumber,
	IsString,
	IsBoolean,
	IsNotEmpty,
	IsOptional,
	IsEnum,
	IsDate
} from "class-validator";

import { ChannelKind } from '@prisma/client';

export class ChannelDto {
	@IsString()
	@IsNotEmpty()
	name: string;

	@IsString()
	@IsOptional()
	password: string;

	@IsEnum(ChannelKind)
	@IsNotEmpty()
	kind: ChannelKind;

	@IsNumber()
	@IsOptional()
	id:	number = 0;

	@IsDate()
	@IsOptional()
	createdAt: Date;

}
