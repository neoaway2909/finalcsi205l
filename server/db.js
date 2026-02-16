import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const config = {
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD, // User provided 'sa'
    server: process.env.DB_SERVER || 'localhost',
    database: process.env.DB_NAME || 'StartCareDB',
    options: {
        encrypt: false, // Use true for Azure, false for local
        trustServerCertificate: true // Change to false for production
    }
};

export async function connectDB() {
    try {
        await sql.connect(config);
        console.log('Connected to MSSQL Database');
        return sql;
    } catch (err) {
        console.error('Database connection failed:', err);
        return null; // Return null on failure so app can handle it
    }
}

export { sql };
