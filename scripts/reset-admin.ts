import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import bcrypt from 'bcryptjs';

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
    const email = 'admin@unik.com';
    const password = 'password';
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.findUnique({
        where: { email }
    });

    if (user) {
        console.log(`User ${email} found. Resetting password...`);
        await prisma.user.update({
            where: { email },
            data: {
                password: hashedPassword,
                role: 'admin'
            }
        });
        console.log('Password reset to "password".');
    } else {
        console.log(`User ${email} not found. Creating...`);
        await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name: 'Admin',
                role: 'admin'
            }
        });
        console.log('User created with password "password".');
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
