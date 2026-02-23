import { createClient } from '@libsql/client';
import Database from 'better-sqlite3';

const TURSO_URL = process.env.TURSO_DATABASE_URL || 'libsql://furniture-shop-seriousmebel.aws-eu-west-1.turso.io';
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzE4NzY2MzUsImlkIjoiMzBmMGE0YTUtODZhYi00NzQ2LTg5MzctNjYyYWZjMDhhZTc2IiwicmlkIjoiYWFlOWRmMjctOTVkNi00MzQ2LWI5M2EtM2RjNWFiZGZhYTA0In0.MpmS3hyjXeicEaOS0tPVWTBlVtVZTAfcNLvSXpTJ_vI27nLlEsCsj05lxqj6R9c_UkopLg25JN3lDJcpxhDVBA';

async function migrate() {
    // Connect to local SQLite
    const localDb = new Database('./dev.db');

    // Connect to Turso
    const turso = createClient({
        url: TURSO_URL,
        authToken: TURSO_TOKEN,
    });

    console.log('Connected to Turso and local DB');

    // Get all table schemas from local DB
    const tables = localDb.prepare(
        "SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma_%'"
    ).all() as { name: string; sql: string }[];

    // Also get prisma migration tables
    const prismaTables = localDb.prepare(
        "SELECT name, sql FROM sqlite_master WHERE type='table' AND name LIKE '_prisma_%'"
    ).all() as { name: string; sql: string }[];

    const allTables = [...prismaTables, ...tables];

    // Get indexes
    const indexes = localDb.prepare(
        "SELECT sql FROM sqlite_master WHERE type='index' AND sql IS NOT NULL"
    ).all() as { sql: string }[];

    // Create tables in Turso
    console.log('\n--- Creating tables ---');
    for (const table of allTables) {
        console.log(`Creating table: ${table.name}`);
        try {
            await turso.execute(`DROP TABLE IF EXISTS "${table.name}"`);
            await turso.execute(table.sql);
        } catch (err: any) {
            console.error(`Error creating ${table.name}:`, err.message);
        }
    }

    // Create indexes
    console.log('\n--- Creating indexes ---');
    for (const idx of indexes) {
        try {
            await turso.execute(idx.sql);
            console.log('Created index');
        } catch (err: any) {
            console.error('Index error:', err.message);
        }
    }

    // Migrate data table by table
    console.log('\n--- Migrating data ---');
    for (const table of tables) {
        const rows = localDb.prepare(`SELECT * FROM "${table.name}"`).all() as Record<string, any>[];
        console.log(`${table.name}: ${rows.length} rows`);

        if (rows.length === 0) continue;

        // Insert in batches
        const batchSize = 20;
        for (let i = 0; i < rows.length; i += batchSize) {
            const batch = rows.slice(i, i + batchSize);

            for (const row of batch) {
                const columns = Object.keys(row);
                const placeholders = columns.map(() => '?').join(', ');
                const values = columns.map(col => row[col]);
                const colNames = columns.map(c => `"${c}"`).join(', ');

                try {
                    await turso.execute({
                        sql: `INSERT INTO "${table.name}" (${colNames}) VALUES (${placeholders})`,
                        args: values,
                    });
                } catch (err: any) {
                    console.error(`Error inserting into ${table.name}:`, err.message);
                }
            }
        }
        console.log(`  ✓ ${table.name} migrated`);
    }

    // Verify
    console.log('\n--- Verification ---');
    for (const table of tables) {
        const result = await turso.execute(`SELECT COUNT(*) as count FROM "${table.name}"`);
        console.log(`${table.name}: ${result.rows[0].count} rows`);
    }

    localDb.close();
    console.log('\nMigration complete!');
}

migrate().catch(console.error);
