import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

export function openDatabase(path = process.env.DB_PATH ?? 'data/sarmaci.db') {
    mkdirSync(dirname(path), { recursive: true });

    const db = new DatabaseSync(path);

    db.exec('PRAGMA journal_mode = WAL');
    db.exec('PRAGMA foreign_keys = ON');

    return db;
}
