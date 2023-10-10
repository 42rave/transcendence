import { forwardRef, Module } from '@nestjs/common';
import { StatusService } from './status.service';
import { ChatModule } from '@chat/chat.module';
import { GameModule } from '@game/game.module';

@Module({
	imports: [forwardRef(() => ChatModule), GameModule],
	providers: [StatusService],
	exports: [StatusService]
})
export class StatusModule {}
