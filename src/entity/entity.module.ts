import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  StudentGroup,
  StudentGroupSchema,
  
} from './entities/student-group.entity';
import { Template, Templatehema } from './entities/template.entity';
import { Schedule, ScheduleSchema } from './entities/schedule.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StudentGroup.name, schema: StudentGroupSchema },
      { name: Template.name, schema: Templatehema },
      { name: Schedule.name, schema: ScheduleSchema },
    ]),
  ],
  exports: [MongooseModule]
})
export class EntityModule {}
