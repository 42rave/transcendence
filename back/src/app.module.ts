import { Module, MiddlewareConsumer } from '@nestjs/common';
import { UserModule } from '@user/user.module';
import { AuthModule } from '@auth/auth.module';
import { ChatModule } from '@chat/chat.module';
import { GameModule } from '@game/game.module';
import { PrismaModule } from '@prisma/prisma.module';
import { RelationshipModule } from './relationship/relationship.module';
import { TotpMiddleware } from '@middleware/totp.middleware';
import { AppController } from '@/app.controller';
import { ServeStaticModule } from '@nestjs/serve-static';

@Module({
	imports: [
		ServeStaticModule.forRoot({
			rootPath: './avatars',
			serveRoot: '/avatars',
			serveStaticOptions: {
				index: false
			}
		}),
		UserModule,
		AuthModule,
		ChatModule,
		GameModule,
		PrismaModule,
		RelationshipModule
	],
	controllers: [AppController],
	providers: []
})
export class AppModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(TotpMiddleware).forRoutes('*');
	}
}
