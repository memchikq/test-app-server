import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class UpdateScheduleClassroomDto{

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    classRoomId:string

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    timeSlotId:string


}