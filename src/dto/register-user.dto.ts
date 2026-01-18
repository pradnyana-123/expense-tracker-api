import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, Length } from "class-validator";

export class RegisterUserDTO {
  @ApiProperty({
    type: "string",
    description: "The property for username",
    minimum: 1,
    default: 100,
  })
  @IsString()
  @IsNotEmpty()
  @Length(0, 100)
  username: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Length(0, 100)
  password: string;
}
