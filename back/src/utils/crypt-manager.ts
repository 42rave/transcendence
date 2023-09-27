import * as crypto from 'crypto';
import cryptConfig from '@config/crypt.config';

export function encrypt(data: string, iv: string | Buffer) {
	if (typeof iv === 'string') iv = Buffer.from(iv, 'hex');
	const cipher = crypto.createCipheriv('aes-256-cbc', cryptConfig.encrypt_secret, iv);
	return cipher.update(data, 'utf8', 'hex') + cipher.final('hex');
}

export function decrypt(data: string, iv: string | Buffer) {
	if (typeof iv === 'string') iv = Buffer.from(iv, 'hex');
	const decipher = crypto.createDecipheriv('aes-256-cbc', cryptConfig.encrypt_secret, iv);
	return decipher.update(data, 'hex', 'utf8') + decipher.final('utf8');
}
