import { Module } from '@nestjs/common';
import { GolasController } from './goals.controller';
import { GoalService } from './goals.service';

@Module({
  controllers: [GolasController],
  providers: [GoalService],
})
export class GoalModule {}
