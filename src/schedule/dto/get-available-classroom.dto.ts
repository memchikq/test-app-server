import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GetAvailableClassroomDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  timeSlotId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  templateId: string;
}
