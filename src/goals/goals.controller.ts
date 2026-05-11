import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GoalService } from './goals.service';

interface AuthRequest {
  user: {
    id: string;
    email: string;
  };
}

class CreateGoalDto {
  userId!: string;
  title!: string;
  description!: string;
  deadline!: string;
  topics!: { title: string }[];
}

class UpdateTopicStatusDto {
  status!: string;
}

@Controller('goals')
@UseGuards(AuthGuard('jwt'))
export class GolasController {
  constructor(private goalsService: GoalService) {}

  @Get()
  findAll(@Request() req: AuthRequest) {
    return this.goalsService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: AuthRequest) {
    return this.goalsService.findOne(id, req.user.id);
  }

  @Post()
  create(@Body() body: CreateGoalDto, @Request() req: AuthRequest) {
    return this.goalsService.create(
      req.user.id,
      body.title,
      body.description,
      body.deadline,
      body.topics,
    );
  }

  @Patch(':goalId/topics/:topicId')
  updateTopicStatus(
    @Param('goalId') goalId: string,
    @Param('topicId') topicId: string,
    @Body() body: UpdateTopicStatusDto,
    @Request() req: AuthRequest,
  ) {
    return this.goalsService.updateTopicStatus(
      req.user.id,
      goalId,
      topicId,
      body.status,
    );
  }

  @Delete(':id')
  delete(@Param('id') id: string, @Request() req: AuthRequest) {
    return this.goalsService.delete(id, req.user.id);
  }
}
