import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class MessageDto {
	@IsString()
	@IsNotEmpty()
	@Transform(({ value }) => value.trim())
	body: string;
}
