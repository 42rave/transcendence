export default {
	NODE_ENV: String(process.env.NODE_ENV || 'development'),
	BASE_URL: String(process.env.API_URL || 'http://localhost/api')
};
