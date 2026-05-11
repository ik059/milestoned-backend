import { Pool } from 'pg';

export const runMigration = async (pool: Pool): Promise<void> => {
  const client = await pool.connect();
  try {
    console.log('Running Migration!');

    // await client.query(`CREATE EXTENSION IF NOT EXISTS 'pgcrypto';`);

    await client.query(`CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
        );`);

    await client.query(`
        CREATE TABLE IF NOT EXISTS goals (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        deadline DATE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
        );`);

    await client.query(`
        CREATE TABLE IF NOT EXISTS topics (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
        title VARCHAR(255),
        status VARCHAR(50) DEFAULT 'not_started',
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
        );`);

    console.log('Migration completed!');
  } catch (error) {
    console.error('Migration failed!');
    throw error;
  } finally {
    client.release();
  }
};
