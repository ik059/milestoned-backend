/* eslint-disable prettier/prettier */
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class GoalService {
  constructor(@Inject('DB_POOL') private readonly pool: Pool) {}

  async findAll(userID: string) {
    const goalsResult = await this.pool.query(
      `SELECT * from goals WHERE user_id = $1 ORDER BY created_at DESC`,
      [userID],
    );
    const goals = goalsResult.rows;

    const goalsWithTopic = await Promise.all(
      goals.map(async (goal) => {
        const topicResults = await this.pool.query(
          `SELECT * FROM topics WHERE goal_id = $1 ORDER BY created_at ASC`,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          [goal.id],
        );
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return { ...goal, topics:topicResults.rows};
      }),
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return goalsWithTopic;
  }

  async findOne(id: string, userId: string){
    const goalResult = await this.pool.query(
        `SELECT * FROM goals WHERE id = $1 AND user_id = $2`, [id, userId]
    );

    if(goalResult.rows.length === 0){
        throw new NotFoundException("Goal Not found!")
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const goal = goalResult.rows[0]

    const topicsResult = await this.pool.query(
        'SELECT * FROM topics WHERE goal_id = $1 ORDER BY created_at ASC',
        [id]
    );

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {...goal, topics:  topicsResult.rows }

  }

  async create(
    userId: string,
    title: string,
    description: string,
    deadline: string,
    topics:{title:string}[]
  ){
    const client = await this.pool.connect()

    try{
        await client.query('BEGIN')

        const goalResult = await client.query(
            `INSERT INTO goals (user_id, title, description, deadline)
            VALUES ($1, $2, $3, $4)
            RETURNING *`,
            [userId, title, description, deadline]
        );
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const goal = goalResult.rows[0]

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const insertTopics = await Promise.all(
            topics.map((topic)=>
                client.query(
                    `INSERT INTO topics (goal_id, title)
                    VALUES ($1, $2)`,
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    [goal.id, topic.title]
                )
            )
        )
        await client.query('COMMIT')
    }
     
    catch(err){
        await client.query("ROLLBACK")
        throw err;
    }
    finally{
        client.release()
    }
  }

  async updateTopicStatus(
  userId: string,
  goalId: string,
  topicId: string,
  status: string
) {
  // Verify goal belongs to this user
  console.log("G: ", goalId, "UID",userId)
  const goalResult = await this.pool.query(
    'SELECT id FROM goals WHERE id = $1 AND user_id = $2',
    [goalId, userId]
  );

  if (!goalResult.rows.length) {
    console.log("A")
    throw new NotFoundException('Goal not found!');
  }

  // Update topic status
  const topicResult = await this.pool.query(
    `UPDATE topics SET status = $1
     WHERE id = $2 AND goal_id = $3
     RETURNING *`,
    [status, topicId, goalId]
  );

  // ✅ Correct condition
  if (!topicResult.rows.length) {
    console.log("B")
    throw new NotFoundException('Topic not found!');
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return topicResult.rows[0];
}

  async delete(id: string, userId: string){
    const result = await this.pool.query(
        `DELETE FROM goals WHERE id=$1 and user_id=$2`,
        [id, userId]
    );
    if(result.rows.length === 0){
        throw new NotFoundException("Goal not found!")
    }
    return {message: "Goal deleted successfully!"}
  }
}
