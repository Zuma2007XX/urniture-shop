// @ts-nocheck
import Database from 'better-sqlite3';

const db = new Database('dev.db');

const rows = db.prepare("SELECT id, name, series, category, images, specifications FROM Product WHERE name LIKE '%Щит вішалка%'").all();

console.log('Found Hanger products:', JSON.stringify(rows, null, 2));
