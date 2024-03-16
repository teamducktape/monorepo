import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { parse } from 'pg-connection-string';
import { Query } from './query';


export interface QueryExecutor<RT> {
  (text: string, values: unknown[]): Promise<RT[]> 
}

export class DataAccessObject {
  private db: Kysely<never>;
  private pool: Pool;

  constructor(connectionString: string) {
    const config = parse(connectionString);

    this.pool = new Pool({
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      host: config.host!,
      port: Number(config.port),
      user: config.user,
      password: config.password,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      database: config.database!,
      ssl: config.ssl ? { rejectUnauthorized: false } : false,
    });

    this.db = new Kysely<never>({
      dialect: new PostgresDialect({ pool: this.pool }),
    });
  }

  query<T, P = any, RT = T[]>(sql: string): Query<T, P, RT> {
    const executor: QueryExecutor<RT> = (text: string, values: unknown[]) => this.rawQuery<RT>(text, values)
    return new Query<T, P, RT>(sql, executor);
  }

  private async rawQuery<RT>(text: string, values: unknown[] = []): Promise<RT[]> {
    const result = await this.pool.query({ text, values })
    return result.rows as RT[];
  }

}
