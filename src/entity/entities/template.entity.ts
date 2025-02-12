import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, ObjectId } from 'mongoose';

export type TemplateDocument = HydratedDocument<Template>;

@Schema()
export class Template {
  @Prop({ required: true })
  name: string;

  @Prop([
    {
      slotId: String,
      startTime: String,
      endTime: String,
    },
  ])
  timeRanges: { slotId: ObjectId; startTime: string; endTime: string }[];

  @Prop([
    {
      classroomId: String,
      name: String,
    },
  ])
  classRooms: { classroomId: ObjectId; name: string }[];

  @Prop([{ subjectId: String, name: String }])
  subjects: { subjectId: ObjectId; name: string }[];
}

export const Templatehema = SchemaFactory.createForClass(Template);
