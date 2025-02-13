import { Body, Controller, Get, Post } from '@nestjs/common';
import { TemplateService } from './template.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { ApiBody } from '@nestjs/swagger';
import { CreateClassRoomDto } from './dto/create-classroom.dto';
import { CreateSubjectDto } from './dto/create-subject.dto';

@Controller('template')
export class TemplateController {
  constructor(private readonly templateService: TemplateService) {}

  @ApiBody({ type: CreateTemplateDto })
  @Post('create')
  async createTemplate(@Body() dto: CreateTemplateDto) {
    return this.templateService.createTemplate(dto);
  }

  @ApiBody({ type: CreateClassRoomDto })
  @Post('classroom/create')
  async createClassRoom(@Body() dto:CreateClassRoomDto){
    return this.templateService.createClassRoom(dto)
  }

  @Post('subject/create')
  async createSubject(@Body() dto:CreateSubjectDto){
    return this.templateService.createSubject(dto)
  }

  @Get('classroom')
  async getClassRoomList(){
    return this.templateService.getClassRoomList()
  }

  @Get('subject')
  async getSubjectList(){
    return this.templateService.getSubjectList()
  }

  @Get()
  async getTemplateList() {
    return this.templateService.getTemplateList();
  }
}
