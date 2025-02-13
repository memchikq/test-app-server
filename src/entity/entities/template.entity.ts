import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, ObjectId, SchemaTypes, Types } from 'mongoose';
import { Subject } from './subject.entity';
import { ClassRooms } from './classrooms.entity';

export type TemplateDocument = HydratedDocument<Template>;

@Schema()
export class Template {
  @Prop({ required: true })
  name: string;

  @Prop([
    {
      _id: Types.ObjectId,
      startTime: String,
      endTime: String,
    },
  ])
  timeRanges: { _id: Types.ObjectId; startTime: string; endTime: string }[];

  @Prop({ type: [{ type: SchemaTypes.ObjectId, ref: Subject.name }] })
  subjects: Types.ObjectId[];

  @Prop({ type: [{ type: SchemaTypes.ObjectId, ref: ClassRooms.name }] })
  classRooms: Types.ObjectId[];
}

export const Templatehema = SchemaFactory.createForClass(Template);
