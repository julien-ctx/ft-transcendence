import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { Ball, Paddle } from './objects/objects';

@Module({
  providers: [GameService, Ball, Paddle],
  controllers: [GameController],
})
export class GameModule {}
