import { Controller,
	Get,
	Post,
	Req,
	Body,
	UseGuards,
	Param,
	ParseIntPipe,
	ValidationPipe,
	UsePipes,
	ForbiddenException
} from '@nestjs/common';
import { AuthenticatedGuard } from '@guard/authenticated.guard';
import { RelationshipService } from './relationship.service';
import type { Request } from '@type/request';
import { Relationship } from '@prisma/client';

@Controller('relationship')
@UseGuards(...AuthenticatedGuard)
export class RelationshipController {
	constructor(private readonly relationshipService: RelationshipService) {}
	
	@Get()
	async getAll(@Req() req: Request): Promise<Relationship[]> {
		return await this.relationshipService.getAll(req.user.id);
	}

	@Get('friends')
	async getAllFriends(@Req() req: Request): Promise<Relationship[]> {
		return await this.relationshipService.getAllFriends(req.user.id);
	}

	@Get('blocked')
	async getAllBlocked(@Req() req: Request): Promise<Relationship[]> {
		return await this.relationshipService.getAllBlocked(req.user.id);
	}

	@Get(':id')
	async getRelationShip(@Req() req: Request,
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

	@Post(':id/remove')
	@UseGuards(...AuthenticatedGuard)
	async remove(@Req() req: Request, @Param('id', ParseIntPipe) targetId: number) {
		return await this.relationshipService.remove(req.user.id, targetId);
	}
}

