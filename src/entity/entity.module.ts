import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  StudentGroup,
  StudentGroupSchema,
  
} from './entities/student-group.entity';
import { Template, Templatehema } from './entities/template.entity';
import { Schedule, ScheduleSchema } from './entities/schedule.entity';
import { ClassRooms, ClassRoomsSchema } from './entities/classrooms.entity';
import { Subject, SubjectSchema } from './entities/subject.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StudentGroup.name, schema: StudentGroupSchema },
      { name: Template.name, schema: Templatehema },
      { name: Schedule.name, schema: ScheduleSchema },
      { name: ClassRooms.name, schema: ClassRoomsSchema },
      { name: Subject.name, schema: SubjectSchema },
    ]),
  ],
  exports: [MongooseModule]
})
export class EntityModule {}
