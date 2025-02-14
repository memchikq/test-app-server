import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Document, Model, Types } from 'mongoose';
import {
  Schedule,
  ScheduleDocument,
} from 'src/entity/entities/schedule.entity';
import { GenerateScheduleDto } from './dto/generate-schedule.dto';
import { Template } from 'src/entity/entities/template.entity';
import {
  StudentGroup,
  StudentGroupDocument,
} from 'src/entity/entities/student-group.entity';
import { GetScheduleDto } from './dto/get-schedule.dto';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectModel(Schedule.name)
    private scheduleModel: Model<Schedule>,
    @InjectModel(Template.name)
    private templateModel: Model<Template>,
    @InjectModel(StudentGroup.name)
    private studentGroupModel: Model<StudentGroup>,
  ) {}

  async getSchedule(dto:GetScheduleDto) {
    try {
      const scheduleData = await this.scheduleModel.aggregate([
        {
          $match: { templateId: new Types.ObjectId(dto.templateId) },
        },
        {
          $unwind: '$slots',
        },
        {
          $lookup: {
            from: 'classrooms',
            localField: 'slots.classroomId',
            foreignField: '_id',
            as: 'slots.classroomData',
          },
        },
        {
          $lookup: {
            from: 'studentgroups',
            localField: 'slots.groupId',
            foreignField: '_id',
            as: 'slots.groupData',
          },
        },
        {
          $lookup: {
            from: 'subjects',
            localField: 'slots.subjectId',
            foreignField: '_id',
            as: 'slots.subjectData',
          },
        },
        {
          $group: {
            _id: '$slots.groupId',
            order: { $first: '$order' },
            slots: { $push: '$slots' },
          },
        },
        {
          $sort: { order: 1 },
        },
        {
          $project: {
            _id: 1,
            order: 1,
            slots: {
              $map: {
                input: '$slots',
                as: 'slot',
                in: {
                  timeSlot: '$$slot.timeSlot',
                  isFixed: '$$slot.isFixed',
                  classroomData: '$$slot.classroomData',
                  groupData: '$$slot.groupData',
                  subjectData: '$$slot.subjectData',
                },
              },
            },
          },
        },
      ]);
      return scheduleData;
    } catch (error) {
      throw error;
    }
  }

  async generateSchedule(dto: GenerateScheduleDto) {
    try {
      const template = await this.templateModel.findById(dto.templateId);
      const groups = await this.studentGroupModel.find();
      if (!groups.length) {
        throw new BadRequestException('Список групп пуст');
      }
      if (!template) {
        throw new BadRequestException('Шаблон не найден');
      }

      const schedules = [];
      const timeSlots = template.timeRanges;
      ;
      const subjects = template.subjects;
      const maxPossibleGroups = timeSlots.length * template.classRooms.length;
      if (groups.length > maxPossibleGroups) {
        throw new BadRequestException(
          `Невозможно распределить все группы. Максимальное количество групп которое можно распределить: ${maxPossibleGroups}`,
        );
      }
      const shuffledGroups = this.shuffleArray([
        ...groups,
      ]) as StudentGroupDocument[];
      let order = 0;
      const groupOrderMap = new Map();
      for (const timeSlot of timeSlots) {
        const usedSlots = new Map();
        
        let classRoomIndex = 0;
        const classRooms = this.shuffleArray([...template.classRooms])
        for (const group of shuffledGroups) {
          const subject = subjects[Math.floor(Math.random() * subjects.length)];
          const classRoom = classRooms[classRoomIndex];
          classRoomIndex++;
          if (
            !this.isConflict(
              usedSlots,
              group._id.toString(),
              timeSlot._id.toString(),
              classRoom._id.toString(),
            )
          ) {
            this.markSlotAsUsed(
              usedSlots,
              group._id.toString(),
              timeSlot._id.toString(),
              classRoom._id.toString(),
            );
            if (!groupOrderMap.has(group.id)) {
              order++;
              groupOrderMap.set(group.id, order);
            }

            const currentOrder = groupOrderMap.get(group.id);

            schedules.push({
              templateId: template._id,
              order: currentOrder,
              slots: {
                groupId: group._id,
                subjectId: subject._id,
                timeSlot: {
                  startTime: timeSlot.startTime,
                  endTime: timeSlot.endTime,
                },
                classroomId: classRoom._id,
                isFixed: false,
              },
            });
          } else {
            console.warn(
              `Невозможно назначить группу ${group.name} в слот ${timeSlot}`,
            );
          }
        }
      }
      await this.scheduleModel.insertMany(schedules);
      return schedules;
    } catch (error) {
      throw error;
    }
  }

  private isConflict(
    usedSlots: Map<string, Set<string>>,
    groupId: string,
    timeSlot: string,
    classRoom: string,
  ): boolean {
    if (usedSlots.has(classRoom) && usedSlots.get(classRoom).has(timeSlot)) {
      return true;
    }

    const groupKey = `group-${groupId}`;
    if (usedSlots.has(groupKey) && usedSlots.get(groupKey).has(timeSlot)) {
      return true;
    }
    return false;
  }

  private markSlotAsUsed(
    usedSlots: Map<string, Set<string>>,
    groupId: string,
    timeSlot: string,
    classRoom: string,
  ): void {
    if (!usedSlots.has(classRoom)) {
      usedSlots.set(classRoom, new Set());
    }
    usedSlots.get(classRoom).add(timeSlot);

    const groupKey = `group-${groupId}`;
    if (!usedSlots.has(groupKey)) {
      usedSlots.set(groupKey, new Set());
    }
    usedSlots.get(groupKey).add(timeSlot);
  }
  private shuffleArray(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}
