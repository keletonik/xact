/** Drizzle Kit config — used by `npm run db:push`. */
export default {
  schema: './src/db/schema.js',
  out: './src/db/migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.DATABASE_URL || './evalax.db',
  },
};
