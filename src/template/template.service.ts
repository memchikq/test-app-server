import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Template } from 'src/entity/entities/template.entity';
import { CreateTemplateDto } from './dto/create-template.dto';

@Injectable()
export class TemplateService {
  constructor(
    @InjectModel(Template.name)
    private templateModel: Model<Template>,
  ) {}

  async createTemplate(dto: CreateTemplateDto) {
    try {
      const template = await this.templateModel.create(dto);
      return template;
    } catch (error) {
      throw error;
    }
  }
}
