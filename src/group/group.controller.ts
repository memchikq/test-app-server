import { Body, Controller, Get, Post } from '@nestjs/common';
import { GroupService } from './group.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { ApiBody } from '@nestjs/swagger';

@Controller('group')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @ApiBody({ type:CreateGroupDto  })
  @Post('create')
  async createGroup(@Body() dto:CreateGroupDto){  
    return await this.groupService.createGroup(dto);
  }
  
  @Get()
  async getGroupList(){  
    return await this.groupService.getGroupList();
  }
}
