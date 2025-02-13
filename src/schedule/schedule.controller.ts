import { Controller, Get, Post } from '@nestjs/common';
import { ScheduleService } from './schedule.service';

@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get('generate')
  async generateSchedule(){
    return this.scheduleService.generateSchedule({templateId:"67adb2da597e93b8301a198e"});
  }

  @Get()
  async getD(){
    return this.scheduleService.getD()
  }

}
