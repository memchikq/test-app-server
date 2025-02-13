import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ClassRoomsDocument = HydratedDocument<ClassRooms>;

@Schema()
export class ClassRooms {
  @Prop({ required: true, unique: true })
  name: string;
}

export const ClassRoomsSchema = SchemaFactory.createForClass(ClassRooms);
