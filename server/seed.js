import { connectDB, sql } from './db.js';
import bcrypt from 'bcryptjs';

async function seed() {
    try {
        console.log('Connecting to database...');
        await connectDB();

        const hashedPassword = await bcrypt.hash('123456', 10);

        const request = new sql.Request();

        // Check if exists
        console.log('Checking for existing admin...');
        const check = await request.query("SELECT * FROM Users WHERE id = 'admin1'");

        if (check.recordset.length > 0) {
            console.log('User "admin1" already exists. Updating password...');
            // Optional: Update password to ensure it's known
            await request.query(`
                UPDATE Users 
                SET password = '${hashedPassword}', email = 'admin@example.com' 
                WHERE id = 'admin1'
            `);
            console.log('Admin password updated to "123456".');
        } else {
            console.log('Creating new admin user...');
            await request.query(`
                INSERT INTO Users (id, password, role, displayName, email)
                VALUES ('admin1', '${hashedPassword}', 'admin', 'Admin User', 'admin@example.com')
            `);
            console.log('Admin user created successfully.');
        }

        console.log('-----------------------------------');
        console.log('Login credentials:');
        console.log('Email/ID: admin@example.com (or admin1)');
        console.log('Password: 123456');
        console.log('-----------------------------------');

        process.exit(0);
    } catch (err) {
        console.error('Error seeding database:', err);
        process.exit(1);
    }
}

seed();
