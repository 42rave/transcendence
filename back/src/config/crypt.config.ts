export default {
	iv: process.env.INIT_VECTOR || 'iv-unsecure.....',
	encrypt_secret: process.env.ENCRYPT_SECRET || 'totp-encrypt-secret-unsecure....'
};
