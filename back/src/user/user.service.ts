import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { UserDto } from '@type/user.dto';
import { Otp, User } from '@prisma/client';
import { decrypt, encrypt } from '@/utils/crypt-manager';
import { RelationKind } from '@prisma/client';

@Injectable()
export class UserService {
	constructor(private prisma: PrismaService) {}

	async create(data: UserDto): Promise<User> {
		return this.prisma.user.create({ data });
	}

	async getAll(): Promise<User[]> {
		return this.prisma.user.findMany();
	}

	async getById(id: number): Promise<User> {
		return this.prisma.user.findUnique({ where: { id: id } });
	}

	async getByName(username: string): Promise<User> {
		return this.prisma.user.findUnique({ where: { username } });
	}

	async update(data: { id?: number; username?: string; avatar?: string }): Promise<User> {
		return this.prisma.user.update({ where: { id: data.id }, data });
	}

	async delete(id: number): Promise<User> {
		return this.prisma.user.delete({ where: { id } });
	}

	async createOrUpdate(data: UserDto): Promise<User> {
		return this.prisma.user
			.upsert({
				where: { id: data.id },
				create: data,
				update: {}
			})
			.catch(async (e) => {
				if (e.code === 'P2002') {
					return this.createOrUpdate({ ...data, username: data.username + '_' + Math.floor(Math.random() * 10000) });
				}
			});
	}

	async setSecret(userId: number, secret: string, iv: string): Promise<Otp> {
		secret = encrypt(secret, iv);
		return this.prisma.otp.upsert({
			where: { userId },
			create: { secret, userId, iv },
			update: { secret, iv }
		});
	}

	async getSecret(userId: number): Promise<Otp> {
		const otp = await this.prisma.otp.findUnique({ where: { userId } });
		if (!otp) return undefined;
		otp.secret = decrypt(otp.secret, otp.iv);
		return otp;
	}

	async enableTotp(userId: number): Promise<User> {
		return this.prisma.user.update({ where: { id: userId }, data: { twoFAEnabled: true }, include: { otp: true } });
	}

	async disableTotp(userId: number): Promise<User> {
		await this.prisma.otp.delete({ where: { userId } }).catch(() => {});
		return this.prisma.user.update({ where: { id: userId }, data: { twoFAEnabled: false } });
	}

	async getBlockedUsersIds(user: User): Promise<number[]> {
		return (
			await this.prisma.relationship.findMany({
				where: {
					AND: [{ senderId: user.id }, { kind: RelationKind.BLOCKED }]
				}
			})
		).map((blocked) => blocked.receiverId);
	}
}
