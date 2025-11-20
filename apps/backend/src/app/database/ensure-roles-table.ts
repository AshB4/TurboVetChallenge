import { existsSync } from 'node:fs';
import sqlite3 from 'sqlite3';

function openDatabase(path: string): Promise<sqlite3.Database> {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(path, (error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(db);
    });
  });
}

function all<T>(db: sqlite3.Database, sql: string): Promise<T[]> {
  return new Promise((resolve, reject) => {
    db.all<T>(sql, (error, rows) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(rows);
    });
  });
}

function run(db: sqlite3.Database, sql: string): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run(sql, (error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

function close(db: sqlite3.Database): Promise<void> {
  return new Promise((resolve, reject) => {
    db.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

export async function ensureRolesTableHasId(databasePath: string): Promise<void> {
  if (!databasePath || databasePath === ':memory:' || !existsSync(databasePath)) {
    return;
  }

  const db = await openDatabase(databasePath);

  try {
    const [existingTable] = await all<{ name: string }>(
      db,
      "SELECT name FROM sqlite_master WHERE type='table' AND name='roles'",
    );

    if (!existingTable) {
      return;
    }

    const columns = await all<{ name: string }>(db, "PRAGMA table_info('roles')");
    const hasIdColumn = columns.some((column) => column.name === 'id');

    if (hasIdColumn) {
      return;
    }

    console.warn(
      '[database] Dropping legacy roles table without an id column to allow schema resynchronization.',
    );

    await run(db, 'DROP TABLE "roles"');
  } finally {
    await close(db);
  }
}
