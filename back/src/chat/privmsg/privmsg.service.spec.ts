import { Test, TestingModule } from '@nestjs/testing';
import { PrivmsgService } from './privmsg.service';

describe('PrivmsgService', () => {
	let service: PrivmsgService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [PrivmsgService]
		}).compile();

		service = module.get<PrivmsgService>(PrivmsgService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
