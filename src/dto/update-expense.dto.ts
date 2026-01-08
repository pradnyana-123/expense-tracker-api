import { IsDecimal, IsOptional, IsString } from 'class-validator';

export class UpdateExpenseDTO {
  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  amount?: string;
}
