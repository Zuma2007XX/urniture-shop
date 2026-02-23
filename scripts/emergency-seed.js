const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

async function main() {
    const dbPath = path.join(process.cwd(), 'dev.db');
    console.log('Opening database at:', dbPath);
    const db = new Database(dbPath);

    const password = await bcrypt.hash('admin123', 12);
    const now = new Date().toISOString();

    try {
        // Check if user exists
        const checkStmt = db.prepare('SELECT id FROM User WHERE email = ?');
        const existing = checkStmt.get('admin@unik.com');

        if (existing) {
            console.log('Admin user already exists.');
            return;
        }

        const stmt = db.prepare('INSERT INTO User (id, email, password, name, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)');
        stmt.run('cm3adminuser00000000000001', 'admin@unik.com', password, 'Адміністратор', 'admin', now, now);
        console.log('Admin user created successfully.');
    } catch (e) {
        console.error('Error creating admin user:', e);
    }
}

main();
