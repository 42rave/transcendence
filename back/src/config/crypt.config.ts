export default {
	// 'totp-encrypt-secret-unsecure....' is a default secret, set only if the env variable ENCRYPT_SECRET is not defined.
	// It must be defined on the .env file of the project.
	encrypt_secret: String(process.env.ENCRYPT_SECRET || 'totp-encrypt-secret-unsecure....')
};
