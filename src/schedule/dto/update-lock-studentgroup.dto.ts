import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class UpdateLockStudentGroup {

  @ApiProperty()
  @IsBoolean()
  lock: boolean;
}
