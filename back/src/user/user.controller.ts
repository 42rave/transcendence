import {
	BadRequestException,
	Body,
	Controller,
	Get,
	Param,
	ParseIntPipe,
	Post,
	UsePipes,
	ValidationPipe,
	UploadedFile,
	UseInterceptors,
	UseGuards,
	Req,
	Put,
	ConflictException,
	ImATeapotException
} from '@nestjs/common';
import { UserService } from './user.service';
import { UsernameDto } from '@type/user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthenticatedGuard } from '@guard/authenticated.guard';
import { diskStorage } from 'multer';
import appConfig from '@config/app.config';
import { User } from '@prisma/client';
import type { Request } from '@type/request';
import { StatusService } from '@user/status/status.service';

declare type File = Express.Multer.File;

@Controller('user')
@UseGuards(...AuthenticatedGuard)
export class UserController {
	constructor(
		private readonly userService: UserService,
		private readonly statusService: StatusService
	) {}

	@Get()
	async getAllUsers() {
		try {
			return await this.userService.getAll();
		} catch {
			throw new BadRequestException();
		}
	}

	@Get(':id')
	async getUserById(@Param('id', ParseIntPipe) id: number): Promise<(User & { status: string }) | undefined> {
		const user = await this.userService.getById(id);
		if (!user) return undefined;
		return { ...user, ...(await this.statusService.getByUserId(id)) };
	}

	@Get('name/:name')
	@UsePipes(ValidationPipe)
	async getUserByName(@Req() req: Request, @Param('name') name: string) {
		const user = await this.userService.getByName(name);
		if (!user) {
			throw new ImATeapotException('No such user');
		}
		return { ...user, ...(await this.statusService.getByUserId(user.id)) };
	}

	@Put('username')
	@UsePipes(new ValidationPipe())
	async updateUser(@Req() req: Request, @Body() data: UsernameDto) {
		return await this.userService
			.update({
				id: req.user.id,
				...data
			})
			.catch((e) => {
				if (e.code === 'P2002') {
					throw new ConflictException('Username already taken');
				}
			});
	}

	@Post('avatar')
	@UseInterceptors(
		FileInterceptor('file', {
			storage: diskStorage({
				destination: (_req: Request, _file: File, cb) => {
					cb(null, './avatars');
				},
				filename: (_req: Request, _file: File, cb) => {
					console.log('filename: ', _file.mimetype);
					switch (_file.mimetype) {
						case 'image/png':
							return cb(null, `${_req.user.id}.png`);
						case 'image/jpeg':
							return cb(null, `${_req.user.id}.jpeg`);
						case 'image/gif':
							return cb(null, `${_req.user.id}.gif`);
					}
					return cb(null, `${_req.user.id}`);
				}
			}),
			limits: {
				fileSize: 5 * 1024 * 1024, // 5MB
				files: 1
			},
			fileFilter(_req: Request, _file: File, cb: (error: Error | null, acceptFile: boolean) => void) {
				console.log('fileFilter: ', _file.mimetype);
				if (_file.mimetype !== 'image/png' && _file.mimetype !== 'image/jpeg' && _file.mimetype !== 'image/gif')
					return cb(new BadRequestException('Invalid file type. Only jpeg, png and gif are allowed.'), false);
				cb(null, true);
			}
		})
	)
	async uploadAvatar(@Req() req: Request, @UploadedFile() file: File): Promise<{ user: User; file: File }> {
		const user = await this.userService.update({
			id: req.user.id,
			avatar: `${appConfig.BASE_URL}/${file.path}`
		});
		return { file, user };
	}
}
