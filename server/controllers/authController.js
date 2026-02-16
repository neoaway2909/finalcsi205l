import { sql } from '../db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'your_super_secret_key'; // Should be in .env

// Helper to generate Token
const generateToken = (user) => {
    return jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, { expiresIn: '1d' });
};

// POST /api/register
export const register = async (req, res) => {
    const { id, password, displayName, email, gender, dob, phone, address, province, district, subDistrict, medicalHistory } = req.body;

    if (!id || !password || !displayName) {
        return res.status(400).json({ message: 'Missing required fields (id, password, displayName)' });
    }

    try {
        // Check if user already exists
        const request = new sql.Request();
        request.input('id', sql.NVarChar, id);
        const checkResult = await request.query('SELECT id FROM Users WHERE id = @id');

        if (checkResult.recordset.length > 0) {
            return res.status(409).json({ message: 'User ID already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user (Patient role by default for public registration)
        const insertRequest = new sql.Request();
        insertRequest.input('id', sql.NVarChar, id);
        insertRequest.input('password', sql.NVarChar, hashedPassword);
        insertRequest.input('role', sql.NVarChar, 'patient');
        insertRequest.input('displayName', sql.NVarChar, displayName);
        insertRequest.input('email', sql.NVarChar, email || null);
        insertRequest.input('gender', sql.NVarChar, gender || null);
        insertRequest.input('dob', sql.Date, dob || null);
        insertRequest.input('phone', sql.NVarChar, phone || null);
        insertRequest.input('address', sql.NVarChar, address || null);
        insertRequest.input('province', sql.NVarChar, province || null);
        insertRequest.input('district', sql.NVarChar, district || null);
        insertRequest.input('subDistrict', sql.NVarChar, subDistrict || null);
        insertRequest.input('medicalHistory', sql.NVarChar, medicalHistory || null);

        await insertRequest.query(`
            INSERT INTO Users (id, password, role, displayName, email, gender, dob, phone, address, province, district, subDistrict, medicalHistory)
            VALUES (@id, @password, @role, @displayName, @email, @gender, @dob, @phone, @address, @province, @district, @subDistrict, @medicalHistory)
        `);

        // Generate token and return basic info
        const token = generateToken({ id, role: 'patient' });
        res.status(201).json({
            message: 'Registration successful',
            token,
            user: { id, role: 'patient', displayName }
        });

    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

// POST /api/login
export const login = async (req, res) => {
    console.log('Login Attempt:', req.body);
    const { id, password } = req.body;

    if (!id || !password) {
        return res.status(400).json({ message: 'Please provide ID and password' });
    }

    try {
        const request = new sql.Request();
        request.input('param', sql.NVarChar, id);

        // Allow login with ID or Email
        const result = await request.query('SELECT * FROM Users WHERE id = @param OR email = @param');
        const user = result.recordset[0];

        console.log('User found from DB:', user ? user.id : 'No user found');

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials (User not found)' });
        }

        // Verify password
        // Note: For existing sample data (admin1/1234), password might be plain text if inserted manually directly to DB without hashing.
        // We handle both cases for transition: IF validation fails, check plain text (only for development/migration)
        let isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch && user.password === password) {
            // Fallback for plain text passwords in DB (like '1234')
            isMatch = true;
            // Ideally you should re-hash and save it here.
        }

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = generateToken(user);

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;

        res.json({
            message: 'Login successful',
            token,
            user: userWithoutPassword
        });

    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Server error during login' });
    }
};

// GET /api/user/:id
export const getUser = async (req, res) => {
    const { id } = req.params;

    // In a real app, middleware should verify the token and ensure user can access this.

    try {
        const request = new sql.Request();
        request.input('id', sql.NVarChar, req.params.id);
        const result = await request.query('SELECT * FROM Users WHERE id = @id');


        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = result.recordset[0];
        const { password: _, ...userWithoutPassword } = user;

        res.json(userWithoutPassword);

    } catch (err) {
        console.error('Get User error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
