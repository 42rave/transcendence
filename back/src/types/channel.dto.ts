import { IsNumber, IsString, IsBoolean, IsNotEmpty, IsOptional } from "class-validator";

export class ChannelDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  password: string;

	//THERE IS AN ISSUE HERE THIS SHOULD BE AN ENUM NOT A STRING
	//we need to check for class-validator for enums
  @IsString()
  @IsNotEmpty()
  kind: string;

  @IsNumber()
  createdAt: number;
}
