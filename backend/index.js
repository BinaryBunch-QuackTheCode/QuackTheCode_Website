import express from 'express';
import { leetcodeQuestion } from './leetcode.js';
import cors from 'cors';
import { Server } from 'socket.io';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

// Create __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173'],
    methods: ['GET', 'POST']
  }
});
const PORT = 3000;

/* 
  If the file already exists at the path then delete it.
  Program will error if the server crashed and we try listening to the same socket
*/

app.use(express.json());
app.use(cors());

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend/dist')));

app.post('/submit', (req, res) => {
  const { code } = req.body;
  console.log(code);
  res.json({ message: 'Hello from the backend!' });
});

app.get('/get_questions', (req, res) => {
  res.json(leetcodeQuestion[Math.floor(Math.random() * leetcodeQuestion.length)]);
});

// Catch-all: serve React app for any other routes (must be LAST)
app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
