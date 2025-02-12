import { Body, Controller, Post } from '@nestjs/common';
import { TemplateService } from './template.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { ApiBody } from '@nestjs/swagger';

@Controller('template')
export class TemplateController {
  constructor(private readonly templateService: TemplateService) {}

  @ApiBody({ type: CreateTemplateDto })
  @Post("create")
  async createTemplate(@Body() dto: CreateTemplateDto) {
    return this.templateService.createTemplate(dto);
  }
}
