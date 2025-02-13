import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Template } from 'src/entity/entities/template.entity';
import { CreateTemplateDto } from './dto/create-template.dto';
import { CreateClassRoomDto } from './dto/create-classroom.dto';
import { ClassRooms } from 'src/entity/entities/classrooms.entity';
import { Subject } from 'src/entity/entities/subject.entity';
import { CreateSubjectDto } from './dto/create-subject.dto';

@Injectable()
export class TemplateService {
  constructor(
    @InjectModel(Template.name)
    private templateModel: Model<Template>,
    @InjectModel(ClassRooms.name)
    private classRoomModel: Model<ClassRooms>,
    @InjectModel(Subject.name)
    private subjectModel: Model<Subject>,
  ) {}

  async createTemplate(dto: CreateTemplateDto) {
    try {
      const template = await this.templateModel.create(dto);
      return template;
    } catch (error) {
      throw error;
    }
  }

  async createClassRoom(dto: CreateClassRoomDto) {
    try {
      const classRoom = await this.classRoomModel.create(dto);
      return classRoom;
    } catch (error) {
      throw error;
    }
  }
  async createSubject(dto: CreateSubjectDto) {
    try {
      const classRoom = await this.subjectModel.create(dto);
      return classRoom;
    } catch (error) {
      throw error;
    }
  }
  async getSubjectList() {
    try {
      const subjects = await this.subjectModel.find();
      return subjects;
    } catch (error) {
      throw error;
    }
  }
  async getClassRoomList() {
    try {
      const classRooms = await this.classRoomModel.find();
      return classRooms;
    } catch (error) {
      throw error;
    }
  }
  async getTemplateList() {
    try {
      const templates = await this.templateModel.find();
      return templates;
    } catch (error) {
      throw error;
    }
  }
}
