import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, ObjectId } from "mongoose";

export type ScheduleDocument = HydratedDocument<Schedule>;

@Schema()
export class Schedule {
  @Prop({type:String})
  templateId: ObjectId;

  @Prop([
    {
      slotId: String,
      classroomId: String,
      subjectId: String,
      groupId: String,
      isFixed: Boolean,
    },
  ])
  slots: {
    slotId: ObjectId;
    classroomId: ObjectId;
    subjectId: ObjectId;
    groupId: ObjectId;
    isFixed: boolean;
  }[];
}

export const ScheduleSchema = SchemaFactory.createForClass(Schedule);