import { Module } from '@nestjs/common';
import { GroupService } from './group.service';
import { GroupController } from './group.controller';
import { EntityModule } from 'src/entity/entity.module';

@Module({
  imports:[EntityModule],
  controllers: [GroupController],
  providers: [GroupService],
})
export class GroupModule {}
