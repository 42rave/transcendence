export default {
	// SUp3r_D3f4u1t_53cr3t is a default secret, set only if the env variable JWT_SECRET is not defined.
	// It must be defined on the .env file of the project.
	secret: String(process.env.JWT_SECRET || 'SUp3r_D3f4u1t_53cr3t'),
	webAppURL: String(process.env.WEB_APP_URL || 'http://localhost:3001'),
	totpIssuer: String(process.env.TOTP_ISSUER || 'Transcendence')
};
