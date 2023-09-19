import { IsNumber, IsOptional, IsString } from 'class-validator';

export class MessageDto {
  @IsOptional()
  @IsNumber()
  id: number;

  @IsString()
  body: string;
}
