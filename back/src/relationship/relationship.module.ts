import { Module } from '@nestjs/common';
import { PrismaModule } from '@prisma/prisma.module';
import { AuthModule } from '@auth/auth.module';
import { RelationshipController } from './relationship.controller';
import { RelationshipService } from './relationship.service';
import { StatusModule } from '@user/status/status.module';
import { ChatModule } from '@chat/chat.module';

@Module({
	imports: [AuthModule, PrismaModule, ChatModule, StatusModule],
	controllers: [RelationshipController],
	providers: [RelationshipService]
})
export class RelationshipModule {}
