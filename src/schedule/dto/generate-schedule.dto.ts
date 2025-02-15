import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class GenerateScheduleDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  templateId: string;
  
  @ApiProperty()
  @IsInt()
  numberVisits:number
}
