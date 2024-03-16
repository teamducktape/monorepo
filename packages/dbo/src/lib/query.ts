import * as yesql from 'yesql';
import { QueryExecutor } from './db';

export class Query<T, P = Record<string, unknown>, RT = T[]> {
  private sql: string;
  private executor: QueryExecutor<RT>;

  constructor(sql: string, executor: QueryExecutor<RT>) {
    this.sql = sql;
    this.executor = executor;
  }

  private processQuery(sql: string, params?: P) {
    const { text, values } = yesql.pg(sql)(params || {});
    return { text, values };
  }

  async one(params?: P): Promise<RT> {
    const { text, values } = this.processQuery(this.sql, params);
    const result = await this.executor(text, values);
    if (result.length !== 1) {
      throw new Error('Expected exactly one row to be returned');
    }
    return result[0];
  }

  async none(params?: P): Promise<void> {
    const { text, values } = this.processQuery(this.sql, params);
    const result = await this.executor(text, values);
    if (result.length !== 0) {
      throw new Error('Expected no rows to be returned');
    }
  }

  async oneOrNone(params?: P): Promise<RT | null> {
    const { text, values } = this.processQuery(this.sql, params);
    const result = await this.executor(text, values);
    if (result.length > 1) {
      throw new Error('Expected one or none rows to be returned');
    }
    return result.length === 1 ? result[0] : null;
  }

  async any(params?: P): Promise<RT[]> {
    const { text, values } = this.processQuery(this.sql, params);
    return await this.executor(text, values);
  }
}