import { IsNotEmpty, IsString, Length } from "class-validator";

export class CreateCategoryDTO {
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  name: string;
}
