import { IsNotEmpty, IsString, Length } from 'class-validator';

export class UserSignupDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 20)
  name: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 300)
  message: string;
}
