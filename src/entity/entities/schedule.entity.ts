import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, ObjectId, Types } from 'mongoose';

export type ScheduleDocument = HydratedDocument<Schedule>;

@Schema()
export class Schedule {
  @Prop({
    type: Types.ObjectId,
    ref: 'Template',
    required: true,
  })
  templateId: ObjectId;

  @Prop()
  order: number;

  @Prop([
    {
      timeSlot: { startTime: String, endTime: String },
      classroomId: Types.ObjectId,
      subjectId: Types.ObjectId,
      groupId: Types.ObjectId,
      isFixed: Boolean,
    },
  ])
  slots: {
    timeSlot: { startTime: string; endTime: string };
    classroomId: ObjectId;
    subjectId: ObjectId;
    groupId: ObjectId;
    isFixed: boolean;
  };
}

export const ScheduleSchema = SchemaFactory.createForClass(Schedule);
