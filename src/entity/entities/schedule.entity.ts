import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, ObjectId, Types } from "mongoose";

export type ScheduleDocument = HydratedDocument<Schedule>;

@Schema()
export class Schedule {
  @Prop({
    type: Types.ObjectId,
    ref: 'Template',
    required: true,
  })
  templateId: ObjectId;

  @Prop([
    {
      timeSlotId: Types.ObjectId,
      classroomId: Types.ObjectId,
      subjectId: Types.ObjectId,
      groupId: Types.ObjectId,
      order: Number,
      isFixed: Boolean,
    },
  ])
  slots: {
    timeSlotId: ObjectId;
    classroomId: ObjectId;
    subjectId: ObjectId;
    groupId: ObjectId;
    isFixed: boolean;
    order: number;
  };
}

export const ScheduleSchema = SchemaFactory.createForClass(Schedule);