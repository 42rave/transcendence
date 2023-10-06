import { forwardRef, Module } from '@nestjs/common';
import { StatusService } from './status.service';
import { ChatModule } from '@chat/chat.module';

@Module({
	imports: [forwardRef(() => ChatModule)],
	providers: [StatusService],
	exports: [StatusService]
})
export class StatusModule {}
