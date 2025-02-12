import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StudentGroup } from 'src/entity/entities/student-group.entity';
import { CreateGroupDto } from './dto/create-group.dto';

@Injectable()
export class GroupService {
  constructor(
    @InjectModel(StudentGroup.name)
    private studentGroupModel: Model<StudentGroup>,
  ) {}

  async createGroup(dto: CreateGroupDto) {
    try {
      const group = await this.studentGroupModel.create(dto);
      return group;
    } catch (error) {
      throw error;
    }
  }
  async getGroupList() {
    try {
      const group = await this.studentGroupModel.find();
      return group;
    } catch (error) {
      throw error;
    }
  }
}
