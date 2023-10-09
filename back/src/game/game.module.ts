import { Module, forwardRef } from '@nestjs/common';
import { GameController } from '@game/game.controller';
import { GameService } from '@game/game.service';
import { PrismaModule } from '@prisma/prisma.module';
import { AuthModule } from '@auth/auth.module';
import { ChatModule } from '@chat/chat.module';
import { GameGateway } from '@game/game.gateway';

//Encapsulation
@Module({
	imports: [AuthModule, PrismaModule, forwardRef(() => ChatModule)],
	controllers: [GameController],
	providers: [GameService, GameGateway],
	exports: [GameGateway, GameService]
})
export class GameModule {}
