import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { isAfter, parse } from 'date-fns';

function isStartTimeBeforeEndTime(startTime: string, endTime: string): boolean {
  const start = parse(startTime, 'HH:mm', new Date());
  const end = parse(endTime, 'HH:mm', new Date());
  return isAfter(end, start);
}

export class TimeRangeDto {
  @ApiProperty({
    description: 'Начальное время в формате HH:mm',
    example: '09:00',
  })
  @IsString()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty({
    description: 'Конечное время в формате HH:mm',
    example: '18:00',
  })
  @IsString()
  @IsNotEmpty()
  endTime: string;

  @ValidateIf((obj) => obj.startTime && obj.endTime)
  validateTimeOrder(): boolean {
    if (!isStartTimeBeforeEndTime(this.startTime, this.endTime)) {
      throw new Error('Начальное время не может быть меньше чем конечное');
    }
    return true;
  }
}

export class ClassRoomDto {
  @ApiProperty({
    description: 'Название класса',
    example: 'Класс 101',
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class SubjectDto {
  @ApiProperty({
    description: 'Название предмета',
    example: 'Математика',
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class CreateTemplateDto {
  @ApiProperty({
    description: 'Список временных интервалов',
    type: [TimeRangeDto],
  })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => TimeRangeDto)
  timeRanges: TimeRangeDto[];

  @ApiProperty({
    description: 'Список классов',
    type: [ClassRoomDto],
  })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ClassRoomDto)
  classRooms: ClassRoomDto[];

  @ApiProperty({
    description: 'Список предметов',
    type: [SubjectDto],
  })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => SubjectDto)
  subjects: SubjectDto[];
}