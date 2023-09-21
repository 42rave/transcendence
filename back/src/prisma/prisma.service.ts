import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import dbConfig from '@config/db.config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
	constructor() {
		super({
			datasources: {
				db: {
					url: `postgresql://${dbConfig.user}:${dbConfig.password}@database:${dbConfig.port}/${dbConfig.db_name}`
				}
			}
		});
	}
	async onModuleInit() {
		await this.$connect();
	}
}
