export default {
	NODE_ENV: String(process.env.NODE_ENV || 'production'),
	BASE_URL: String(process.env.API_URL || 'http://localhost/api')
};
