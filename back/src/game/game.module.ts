import { Module } from '@nestjs/common';
import { GameController } from '@game/game.controller';
import { GameService } from '@game/game.service';
import { PrismaModule } from '@prisma/prisma.module';
import { AuthModule } from '@auth/auth.module';
import { ChatModule } from '@chat/chat.module';

//Encapsulation
@Module({
	imports: [AuthModule, PrismaModule, ChatModule],
	controllers: [GameController],
	providers: [GameService]
})
export class GameModule {}
