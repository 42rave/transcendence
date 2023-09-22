import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class MessageDto {
	@IsOptional()
	@IsNumber()
	id: number;

	@IsString()
	@IsNotEmpty()
	@Transform(({ value }) => value.trim())
	body: string;
}
