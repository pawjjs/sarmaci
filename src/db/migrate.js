import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export function migrateDatabase(db) {
    db.exec(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
            name TEXT PRIMARY KEY
        );
    `);

    const migrations = readdirSync('db/migrations')
        .filter(file => file.endsWith('.sql'))
        .sort();

    for (const migration of migrations) {
        const executed = db.prepare(
            'SELECT name FROM schema_migrations WHERE name = ?'
        ).get(migration);

        if (executed) {
            continue;
        }

        const sql = readFileSync(
            join('db/migrations', migration),
            'utf8'
        );

        db.exec('BEGIN');

        try {
            db.exec(sql);

            db.prepare(
                'INSERT INTO schema_migrations (name) VALUES (?)'
            ).run(migration);

            db.exec('COMMIT');
        } catch (error) {
            db.exec('ROLLBACK');
            throw error;
        }
    }
}
