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
import { UpdateOrderDto } from './dto/update-order.dto';
import { UpdateLockStudentGroup } from './dto/update-lock-studentgroup.dto';

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

  async getSchedule(dto: GetScheduleDto) {
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
            originalId: { $first: '$_id' },
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
            originalId: 1,
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
      const timeSlots = template.timeRanges.slice(0, dto.numberVisits);
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
        const classRooms = this.shuffleArray([...template.classRooms]);
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
                  _id: timeSlot._id,
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

  async regenerateSchedule(dto: GenerateScheduleDto) {
    try {
      const template = await this.templateModel.findById(dto.templateId);
      const groups = await this.studentGroupModel.find();
      if (!groups.length) {
        throw new BadRequestException('Список групп пуст');
      }
      if (!template) {
        throw new BadRequestException('Шаблон не найден');
      }

      const existingSchedules = await this.scheduleModel.find({
        templateId: template._id,
      });

      const fixedSlots = existingSchedules.filter(v=> v.slots[0].isFixed)
      // console.log("fixedSlots",fixedSlots)
      const orders = []
      existingSchedules.forEach(v=>{
        if(!orders.includes(v.order)){
          orders.push(v.order)
        }
      })
      
      const numberVisits = existingSchedules.filter(v=> v.order == orders[0]).length
      const timeSlots = template.timeRanges.slice(0, numberVisits);
      // console.log("awdawd",orders)
      const usedSlots = new Map();
      const groupOrderMap = new Map();
      const usedClassRooms = []; 
      // console.log("fixedSlot",fixedSlots.length)
      for (const fixedSlot of fixedSlots) { 
        console.log(fixedSlot.order,fixedSlot.slots)
        if(orders.includes(fixedSlot.order)){
          const orderIndex = orders.findIndex(v=> v == fixedSlot.order)
          // console.log("fixed",fixedSlot.order)
          if(orderIndex !== -1) orders.splice(orderIndex,1)
        }
        if(!groupOrderMap.has(fixedSlot.slots[0].groupId.toString())){
          groupOrderMap.set(fixedSlot.slots[0].groupId.toString(),fixedSlot.order)
        }
        usedClassRooms.push({
          timeSlot: fixedSlot.slots[0].timeSlot._id.toString(),
          classRoom: fixedSlot.slots[0].classroomId.toString(),
        });
        this.markSlotAsUsed(
          usedSlots,
          fixedSlot?.slots[0].groupId.toString(),
          fixedSlot?.slots[0].timeSlot._id.toString(),
          fixedSlot?.slots[0].classroomId.toString(),
        );
      }

      const schedules = [];
     
      console.log("orders",orders)
      // console.log("timeSlots",timeSlots)
      const subjects = template.subjects;
      const maxPossibleGroups = timeSlots.length * template.classRooms.length;
      // console.log("orders",orders)
      if (groups.length > maxPossibleGroups) {
        throw new BadRequestException(
          `Невозможно распределить все группы. Максимальное количество групп которое можно распределить: ${maxPossibleGroups}`,
        );
      }
      let notLockedGroups = groups.filter(v=>!groupOrderMap.has(v.id))

      const shuffledGroups = this.shuffleArray([
        ...notLockedGroups,
      ]) as StudentGroupDocument[];
     

      for (const timeSlot of timeSlots) {
        const classRooms = this.shuffleArray([...template.classRooms]);
        let classRoomIndex = 0;

        for (const group of shuffledGroups) {
          const subject = subjects[Math.floor(Math.random() * subjects.length)];
          let classRoom = classRooms[classRoomIndex];
          classRoomIndex++;

          if (
            this.isConflict(
              usedSlots,
              group._id.toString(),
              timeSlot._id.toString(),
              classRoom._id.toString(),
            )
          ) {
            
            // const index = classRooms.findIndex((v) =>
            //     usedClassRooms.findIndex((x) => x.classRoom == v._id.toString()) == -1 &&
            //     usedClassRooms.findIndex((x) => x.timeSlot == timeSlot._id.toString()) == -1 &&
            //     (!usedSlots.has(v._id.toString()) || (usedSlots.has(v._id.toString()) && !usedSlots.get(v._id.toString()).has(timeSlot)))
            // );
            const index = classRooms.findIndex((v) => {
              const isUsedInTimeSlot = usedClassRooms.some(
                (x) => x.classRoom === v._id.toString() && x.timeSlot === timeSlot._id.toString()
              );
              const isSlotUsed = usedSlots.get(v._id.toString())?.has(timeSlot._id.toString());
              return !isUsedInTimeSlot && !isSlotUsed;
            });
            classRoom = classRooms[index]
            
          }
      
            this.markSlotAsUsed(
              usedSlots,
              group._id.toString(),
              timeSlot._id.toString(),
              classRoom._id.toString(),
            );

            if (!groupOrderMap.has(group.id)) {
              let order = orders.pop()
              // console.log("order",order)
              groupOrderMap.set(group.id, order);
            }

            const currentOrder = groupOrderMap.get(group.id);
            // console.log("currentOrder",currentOrder)
            schedules.push({
              templateId: template._id,
              order: currentOrder,
              slots: {
                groupId: group._id,
                subjectId: subject._id,
                timeSlot: {
                  _id: timeSlot._id,
                  startTime: timeSlot.startTime,
                  endTime: timeSlot.endTime,
                },
                classroomId: classRoom._id,
                isFixed: false,
              },
            });

        }
      }

      // console.log('sc', schedules);

      // console.log('updatedSchedules', updatedSchedules);
      // console.log("updatedSchedules",schedules)
      // Сохраняем обновленные расписания
      schedules.push(...fixedSlots)
      // console.log("sch",schedules)
      // await this.scheduleModel.deleteMany({ templateId: template._id });
      // await this.scheduleModel.insertMany(schedules);

      return [];
    } catch (error) {
      throw error;
    }
  }

  async updateLockStudentGroup(dto: UpdateLockStudentGroup, id: string) {
    try {
      await this.scheduleModel.updateMany(
        { 'slots.groupId': id },
        { $set: { 'slots.$[elem].isFixed': dto.lock } },
        { arrayFilters: [{ 'elem.groupId': id }] },
      );

      return { message: 'Статус успешно изменен' };
    } catch (error) {
      throw error;
    }
  }

  async updateOrder(dto: UpdateOrderDto) {
    try {
      for (const item of dto.payload) {
        await this.scheduleModel.updateOne(
          { _id: new Types.ObjectId(item.id) },
          { $set: { order: item.order } },
        );
      }
      return { message: 'Поряд успешно изменён' };
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
