import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class RegenerateScheduleDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  templateId: string;
}
