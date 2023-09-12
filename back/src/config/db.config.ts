export default {
  user: process.env.POSTGRES_USER || 'user',
  password: process.env.POSTGRES_PASSWORD || 'password',
  db_name: process.env.POSTGRES_DB || 'db_name',
  port: process.env.POSTGRES_PORT || 5432,
}
