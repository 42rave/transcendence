export default {
  user: String(process.env.POSTGRES_USER) || 'user',
  password: String(process.env.POSTGRES_PASSWORD) || 'password',
  db_name: String(process.env.POSTGRES_DB) || 'db_name',
  port: Number(process.env.POSTGRES_PORT) || 5432,
}