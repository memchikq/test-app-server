import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { GetScheduleDto } from './dto/get-schedule.dto';
import { ApiBody } from '@nestjs/swagger';
import { GenerateScheduleDto } from './dto/generate-schedule.dto';

@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @ApiBody({ type: GenerateScheduleDto })
  @Post('generate')
  async generateSchedule(@Body() dto: GenerateScheduleDto) {
    return this.scheduleService.generateSchedule(dto);
  }

  @Get()
  async getSchedule(@Query() dto: GetScheduleDto) {
    return this.scheduleService.getSchedule(dto);
  }
}
