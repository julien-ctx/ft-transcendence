import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { Ball, GameCanvas, Paddle } from './objects/objects';
import { GameGateway } from './game.gateway';
import { JwtService } from '@nestjs/jwt';

@Module({
  providers: [GameService, Ball, Paddle, GameCanvas, GameGateway, JwtService],
  controllers: [GameController],
})
export class GameModule {}
