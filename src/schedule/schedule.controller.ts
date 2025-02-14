import { Body, Controller, Get, Post, Put, Query } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { GetScheduleDto } from './dto/get-schedule.dto';
import { ApiBody } from '@nestjs/swagger';
import { GenerateScheduleDto } from './dto/generate-schedule.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @ApiBody({ type: GenerateScheduleDto })
  @Post('generate')
  async generateSchedule(@Body() dto: GenerateScheduleDto) {
    return this.scheduleService.generateSchedule(dto);
  }

  @ApiBody({ type: UpdateOrderDto })
  @Put('/update/order')
  async updateOrder(@Body() dto: UpdateOrderDto) {
    return this.scheduleService.updateOrder(dto);
  }

  @Get()
  async getSchedule(@Query() dto: GetScheduleDto) {
    return this.scheduleService.getSchedule(dto);
  }
}
