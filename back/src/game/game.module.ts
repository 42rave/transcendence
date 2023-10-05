import { Module } from '@nestjs/common';
import { GameController } from '@game/game.controller';
import { GameService } from '@game/game.service';
import { PrismaModule } from '@prisma/prisma.module';
import { AuthModule } from '@auth/auth.module';
import { ChatService } from '@chat/chat.service';
import { ChatGateway } from '@chat/chat.gateway';

@Module({
	imports: [AuthModule, PrismaModule],
	controllers: [GameController],
	providers: [GameService, ChatService, ChatGateway]
})
export class GameModule {}
