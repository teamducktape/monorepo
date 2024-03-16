import { dbo } from './dbo';

import { beforeAll, afterAll, describe, it, expect } from 'vitest';
import { DataAccessObject } from './db';

const connectionString = 'postgres://npm_proxy_user:npm_proxy_pw@localhost:5441/npm_proxy'; 
const db = new DataAccessObject(connectionString);

beforeAll(async () => {
  await db.rawQuery(`
    CREATE TABLE IF NOT EXISTS your_table (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100),
      value VARCHAR(100)
    );
  `);

  await db.rawQuery(`
    INSERT INTO your_table (name, value) VALUES
    ('Dummy 1', 'Value 1'),
    ('Dummy 2', 'Value 2'),
    ('Dummy 3', 'Value 3');
  `);
});

afterAll(async () => {
  await db.rawQuery('DROP TABLE IF EXISTS your_table;');
});

describe('DataAccessObject', () => {
  it('executes a query that returns any number of rows', async () => {
    const query = db.query<any>('SELECT * FROM your_table WHERE value = :value');
    const result = await query.any({ value: 'Value 1' });
    expect(result).toBeInstanceOf(Array);
  });

  it('executes a query that returns exactly one row', async () => {
    const query = db.query<any>('SELECT * FROM your_table WHERE id = :id');
    const result = await query.one({ id: 1 });
    expect(result).toBeDefined();
  });
})