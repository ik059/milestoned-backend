import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Pool } from 'pg';
import { runMigration } from './database/migrations';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'https://learning-tracker.milestoned.life',
    ],
    credentials: true,
  });

  app.setGlobalPrefix('api');
  const isNeon = process.env.DATABASE_URL?.includes('neon.tech');

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: isNeon ? { rejectUnauthorized: false } : false,
  });

  await runMigration(pool);
  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log('Server is running on port; ', port);
}
void bootstrap();
