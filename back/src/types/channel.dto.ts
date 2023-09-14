import { IsNumber, IsString, IsBoolean, IsNotEmpty, IsOptional } from "class-validator";

export class ChannelDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  password: string;

  @IsBoolean()
  isPrivateMessage: boolean;
}
