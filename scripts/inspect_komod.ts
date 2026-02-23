// @ts-nocheck
import Database from 'better-sqlite3';

const db = new Database('dev.db');

const rows = db.prepare("SELECT id, name, series, category, images, specifications FROM Product WHERE name LIKE '%омод%' OR name LIKE '%omod%' LIMIT 10").all();

console.log('Found products:', JSON.stringify(rows, null, 2));

