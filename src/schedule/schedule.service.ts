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

  async getD() {
    try {
      // const groupedData = await this.scheduleModel.aggregate([
      //   {
      //     $unwind: '$slots', // Разворачиваем массив slots
      //   },

      //   {
      //     $group: {
      //       _id: '$slots.groupId', // Группируем по groupId
      //       totalSlots: { $sum: 1 }, // Подсчитываем количество слотов
      //       slots: { $push: '$slots' }, // Собираем все слоты в массив
      //     },
      //   },
      //   {
      //     $lookup: {
      //       from: StudentGroup.name, // Коллекция, с которой объединяем
      //       localField: 'slots.groupId', // Поле в текущей коллекции (после $group)
      //       foreignField: '_id', // Поле в коллекции groups
      //       as: 'groupInfo', // Имя нового поля для результатов объединения
      //     },
      //   },
      // ]);
      const scheduleData = await this.scheduleModel.aggregate([
        {
          $lookup: {
            from: 'templates',
            localField: 'templateId',
            foreignField: '_id',
            as: 'templateData',
          },
        },
        { $unwind: '$templateData' }, // Разворачиваем массив с Template
        {
          $unwind: '$slots', // Разворачиваем массив slots (чтобы работать с каждым элементом отдельно)
        },
        {
          $project: {
            _id: 0,
            groupId: '$slots.groupId', // Группируем по groupId
            classroom: {
              $filter: {
                input: '$templateData.classRooms',
                as: 'classroom',
                cond: { $eq: ['$$classroom._id', '$slots.classroomId'] },
              },
            },
            subject: {
              $filter: {
                input: '$templateData.subjects',
                as: 'subject',
                cond: { $eq: ['$$subject._id', '$slots.subjectId'] },
              },
            },
            timeSlot: {
              $filter: {
                input: '$templateData.timeRanges',
                as: 'timeSlot',
                cond: { $eq: ['$$timeSlot._id', '$slots.timeSlotId'] },
              },
            },
            isFixed: '$slots.isFixed',
            order: '$slots.order',
          },
        },
        {
          $group: {
            _id: '$groupId',
            classrooms: { $push: { $arrayElemAt: ['$classroom', 0] } }, // Берём первый элемент массива
            subjects: { $push: { $arrayElemAt: ['$subject', 0] } },
            timeSlots: { $push: { $arrayElemAt: ['$timeSlot', 0] } },
            isFixed: { $push: '$isFixed' },
            order: { $push: '$order' },
          },
        },
      ]);
      return scheduleData
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
      // const classRooms = template.classRooms;
      // const subjects = template.subjects;
      // const maxPossibleGroups = timeSlots.length * classRooms.length;
      // if (groups.length > maxPossibleGroups) {
      //   throw new BadRequestException(
      //     `Невозможно распределить все группы. Максимальное количество групп которое можно распределить: ${maxPossibleGroups}`,
      //   );
      // }
      const shuffledGroups = this.shuffleArray([
        ...groups,
      ]) as StudentGroupDocument[];
      let order = 0;
      // for (const timeSlot of timeSlots) {
      //   const usedSlots = new Map();

      //   let classRoomIndex = 0;

      //   for (const group of shuffledGroups) {
      //     const subject = subjects[Math.floor(Math.random() * subjects.length)];
      //     const classRoom = classRooms[classRoomIndex % classRooms.length];
      //     classRoomIndex++;

      //     if (
      //       !this.isConflict(
      //         usedSlots,
      //         group._id.toString(),
      //         timeSlot._id.toString(),
      //         classRoom._id.toString(),
      //       )
      //     ) {
      //       this.markSlotAsUsed(
      //         usedSlots,
      //         group._id.toString(),
      //         timeSlot._id.toString(),
      //         classRoom._id.toString(),
      //       );
      //       schedules.push({
      //         templateId: template._id,
      //         slots: {
      //           groupId: group._id,
      //           subjectId: subject._id,
      //           timeSlotId: timeSlot._id,
      //           classroomId: classRoom._id,
      //           isFixed: false,
      //           order,
      //         },
      //       });
      //       order++;
      //     } else {
      //       console.warn(
      //         `Невозможно назначить группу ${group.name} в слот ${timeSlot}`,
      //       );
      //     }
      //   }
      // }
      console.log('schedule', schedules);
      console.log('schedule', schedules.length);
      // await this.scheduleModel.insertMany(schedules);
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
