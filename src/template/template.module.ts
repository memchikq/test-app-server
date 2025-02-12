import { Module } from '@nestjs/common';
import { TemplateService } from './template.service';
import { TemplateController } from './template.controller';
import { EntityModule } from 'src/entity/entity.module';

@Module({
  imports:[EntityModule],
  controllers: [TemplateController],
  providers: [TemplateService],
})
export class TemplateModule {}
