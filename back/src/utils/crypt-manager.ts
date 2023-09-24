import * as crypto from 'crypto';
import cryptConfig from '@config/crypt.config';

export function encrypt(data: string) {
	const cipher = crypto.createCipheriv('aes-256-cbc', cryptConfig.encrypt_secret, cryptConfig.iv);
	return cipher.update(data, 'utf8', 'hex') + cipher.final('hex');
}

export function decrypt(data: string) {
	const decipher = crypto.createDecipheriv('aes-256-cbc', cryptConfig.encrypt_secret, cryptConfig.iv);
	return decipher.update(data, 'hex', 'utf8') + decipher.final('utf8');
}
