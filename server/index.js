import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { WebSocketServer } from 'ws';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB, sql } from './db.js';
import { register, login, getUser } from './controllers/authController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Auth Routes
app.post('/api/register', register);
app.post('/api/login', login);
app.get('/api/user/:id', getUser);

// Set up file upload with Multer
const upload = multer({ dest: 'uploads/' });

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// Basic Route
app.get('/', (req, res) => {
    res.send('Server is running!');
});

// File Upload Route
app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    res.send(`File uploaded successfully: ${req.file.originalname}`);
});

// Create HTTP Server
const server = app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

// WebSocket Server
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', (message) => {
        console.log(`Received: ${message}`);
        // Echo back locally
        ws.send(`Server received: ${message}`);
    });

    ws.send('Welcome to the WebSocket server!');
});
