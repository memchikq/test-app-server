import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type StudentGroupDocument = HydratedDocument<StudentGroup>;

@Schema()
export class StudentGroup {
  @Prop({required:true,unique:true})
  name: string;
}

export const StudentGroupSchema = SchemaFactory.createForClass(StudentGroup);
