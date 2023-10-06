import {
	Controller,
	Get,
	Post,
	Delete,
	Req,
	UseGuards,
	Param,
	ParseIntPipe,
	ValidationPipe,
	UsePipes
} from '@nestjs/common';
import { AuthenticatedGuard } from '@guard/authenticated.guard';
import { RelationshipService } from './relationship.service';
import type { Request } from '@type/request';
import { Relationship } from '@prisma/client';
import { StatusService } from '@user/status/status.service';

@Controller('relationship')
@UseGuards(...AuthenticatedGuard)
export class RelationshipController {
	constructor(
		private readonly relationshipService: RelationshipService,
		private statusService: StatusService
	) {}

	@Get()
	async getAll(@Req() req: Request): Promise<Relationship[]> {
		const relations = await this.relationshipService.getAll(req.user.id);
		const statuses = await this.statusService.getByUserIds(relations.map((relation) => relation.receiverId));
		return relations.map((relation, index) => ({
			...relation,
			...statuses[index]
		}));
	}

	@Get('friends')
	async getAllFriends(@Req() req: Request): Promise<Relationship[]> {
		const friends = await this.relationshipService.getAllFriends(req.user.id);
		const statuses = await this.statusService.getByUserIds(friends.map((relation) => relation.receiverId));
		return friends.map((relation, index) => ({
			...relation,
			...statuses[index]
		}));
	}

	@Get('blocked')
	async getAllBlocked(@Req() req: Request): Promise<Relationship[]> {
		const blocked = await this.relationshipService.getAllBlocked(req.user.id);
		const statuses = await this.statusService.getByUserIds(blocked.map((relation) => relation.receiverId));
		return blocked.map((relation, index) => ({
			...relation,
			...statuses[index]
		}));
	}

	@Get(':id')
	async getRelationShip(
		@Req() req: Request,
		@Param('id', ParseIntPipe) targetId: number
		//@Req() req: Request,
	): Promise<Relationship> {
		return await this.relationshipService.getStatus(req.user.id, targetId);
	}

	@Post(':id/add')
	@UseGuards(...AuthenticatedGuard)
	@UsePipes(new ValidationPipe())
	async add(@Req() req: Request, @Param('id', ParseIntPipe) targetId: number) {
		return await this.relationshipService.add(req.user.id, targetId);
	}

	@Post(':id/block')
	@UseGuards(...AuthenticatedGuard)
	async block(@Req() req: Request, @Param('id', ParseIntPipe) targetId: number) {
		return await this.relationshipService.block(req.user.id, targetId);
	}

	@Delete(':id')
	@UseGuards(...AuthenticatedGuard)
	async remove(@Req() req: Request, @Param('id', ParseIntPipe) targetId: number) {
		return await this.relationshipService.remove(req.user.id, targetId);
	}
}
