import { IsDecimal, IsNotEmpty, IsString } from "class-validator";

export class CreateExpenseDTO {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsDecimal({ decimal_digits: "2" })
  @IsNotEmpty()
  amount: string;
}
