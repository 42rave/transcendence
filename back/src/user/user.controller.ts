import {
	BadRequestException,
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
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
	ConflictException
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserDto, UsernameDto } from '@type/user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthenticatedGuard } from '@guard/authenticated.guard';
import { diskStorage } from 'multer';
import appConfig from '@config/app.config';
import { User } from '@prisma/client';
import type { Request } from '@type/request';

declare type File = Express.Multer.File;

@Controller('user')
@UseGuards(...AuthenticatedGuard)
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Get()
	async getAllUsers() {
		try {
			return await this.userService.getAll();
		} catch {
			throw new BadRequestException();
		}
	}

	@Get(':id')
	async getUserById(@Param('id', ParseIntPipe) id: number) {
		return await this.userService.getById(id);
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

	/*
	 ** TODO: Add a 'development' Guard for these routes, so that they can only be accessed in development mode.
	 */
	@Post()
	@HttpCode(200)
	@UsePipes(new ValidationPipe())
	async createOrUpdateUser(@Body() data: UserDto) {
		return await this.userService.createOrUpdate(data);
	}

	@Delete(':id')
	async deleteUserById(@Param('id', ParseIntPipe) id: number) {
		return await this.userService.delete(id);
	}
}
