import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Schedule } from 'src/entity/entities/schedule.entity';
import { GenerateScheduleDto } from './dto/generate-schedule.dto';
import { Template } from 'src/entity/entities/template.entity';
import { StudentGroup } from 'src/entity/entities/student-group.entity';

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

      if (groups.length > template.classRooms.length) {
        throw new BadRequestException(
          'Количество групп больше, чем количество аудиторий',
        );
      }

      const schedule = [];
      const timeSlots = template.timeRanges;
      const classRooms = template.classRooms;

      for (const timeSlot of timeSlots) {
        const shuffledGroups = this.shuffleArray([...groups]);
        for (const group of shuffledGroups) {
          for (const subject of group.subjects) {
            let scheduled = false;
            const shuffledClassRooms = this.shuffleArray([...classRooms]);

            for (const classRoom of shuffledClassRooms) {
              if (!this.isConflict(schedule, group, subject, timeSlot, classRoom)) {
                schedule.push({
                  group: group._id,
                  subject: subject._id,
                  timeSlot,
                  classRoom,
                });
                scheduled = true;
                break;
              }
            }
            if (!scheduled) {
              throw new BadRequestException(
                `Не удалось найти подходящее время и аудиторию для группы ${group.name} и предмета ${subject.name}`,
              );
            }
          }
        }
      }

      await this.scheduleModel.insertMany(schedule);
      return schedule;
    } catch (error) {
      throw error;
    }
  }

  private isConflict(schedule, group, subject, timeSlot, classRoom) {
    return schedule.some(
      (entry) =>
        entry.timeSlot === timeSlot &&
        (entry.classRoom === classRoom || entry.group === group._id || entry.subject === subject._id),
    );
  }

  private shuffleArray(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}
