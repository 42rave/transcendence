import { Module, MiddlewareConsumer } from '@nestjs/common';
import { UserModule } from '@user/user.module';
import { AuthModule } from '@auth/auth.module';
import { ChatModule } from '@chat/chat.module';
import { GameModule } from '@game/game.module';
import { PrismaModule } from '@prisma/prisma.module';
import { PaginationMiddleware } from '@middleware/pagination.middleware';

@Module({
	imports: [UserModule, AuthModule, ChatModule, GameModule, PrismaModule],
	controllers: [],
	providers: []
})
export class AppModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(PaginationMiddleware).forRoutes('*');
	}
}
