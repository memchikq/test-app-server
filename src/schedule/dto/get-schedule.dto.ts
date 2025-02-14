import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GetScheduleDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  templateId: string;
}
