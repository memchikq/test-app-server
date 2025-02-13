import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateClassRoomDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;
}
