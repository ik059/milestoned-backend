/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable prettier/prettier */
 
import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  created_at: Date;
};

@Injectable()
export class UserServices {
  constructor(@Inject('DB_POOL') private readonly pool: Pool) {}
  async findByEmail(email: string): Promise<User | null> {
    const result = await this.pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
    );
    return result.rows[0] || null;
  }

  async findById(id:string):Promise<User | null>{
    const result = await this.pool.query(
        'SELECT id, name, email, created_at FROM users WHERE id = $1',[id]
    );
    return result.rows[0] || null;
  }

   async createUser(name: string, email: string, hashedPassword: string): Promise<User>{
    const result = await this.pool.query(
        `INSERT INTO users (name, email, password)
        VALUES($1, $2, $3)
        RETURNING id, name, email, created_at`,[name, email, hashedPassword]
    );
    return result.rows[0];
   } 
}
