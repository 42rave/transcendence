import { Test, TestingModule } from '@nestjs/testing';
import { PrivmsgController } from './privmsg.controller';

describe('PrivmsgController', () => {
	let controller: PrivmsgController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [PrivmsgController]
		}).compile();

		controller = module.get<PrivmsgController>(PrivmsgController);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});
});
