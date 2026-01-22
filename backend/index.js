import express from 'express';
import { leetcodeQuestion } from './leetcode.js';
import cors from 'cors';
import { Server } from 'socket.io';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import net from 'net';
import { count } from 'console';

// Create __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://44.251.240.201'],
    methods: ['GET', 'POST']
  }
});
const PORT = 3000;
/* 
  IO: The whole server (all connected clients)
  Socket: The current client
*/

const rooms = {}
io.on('connection', async (socket) => { //runs everytime a client connects to the server and gives a socket instance to them
  console.log('User Connected:', socket.id); //users get given a random id when they get connect
  socket.on('join-game', (pin, name) => {
    socket.join(pin);
    const room = io.sockets.adapter.rooms.get(pin)
    const playerCount = room ? room.size : 0;
    console.log(`${name} joined. Players in room ${pin}: ${playerCount}`);
    if (!rooms[pin]) {
      rooms[pin] = [];
    }
    rooms[pin].push({ id: socket.id, name });
    socket.pin = pin;
    io.to(pin).emit('player-count', playerCount);
    io.to(pin).emit('lobby-names', rooms[pin]);
  });

  socket.on('disconnect', (reason) => {
    console.log(`${socket.id} because of: ${reason}`);
    const pin = socket.pin;
    if (!pin) {
      console.log('No pin found for socket');
      return;
    }
    rooms[pin] = rooms[pin].filter((player) => socket.id !== player.id);
    const room_len = io.sockets.adapter.rooms.get(pin)
    const playerCount = room_len ? room_len.size : 0;
    io.to(pin).emit('player-count', playerCount)
    io.to(pin).emit('lobby-names', rooms[pin]);
    if(rooms[pin].length === 0){
      delete rooms[pin]
    }
  })

})

// Use Unix socket on Linux, TCP on Windows
const isWindows = process.platform === 'win32';
const EXECUTOR_PATH = isWindows ? { host: 'localhost', port: 3001 } : { path: '/tmp/executor.sock' };

app.use(express.json());
app.use(cors());

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// API routes
app.post('/submit', (req, res) => {
  const { code } = req.body;
  console.log(code);
  const client = net.createConnection(EXECUTOR_PATH, () => { //runs after connection succeeds
    console.log('Connected to the C++ Executor!');
    const message = {
      player_id: 1,
      user_code: code,
      test_code: ""
    };
    const payload = JSON.stringify(message) + '\n';
    /* 
    sends the JSON through the socket and 
    prints "Payload sent " after the JSON is sent 
    */
    client.write(payload, () => {
      console.log('Payload sent');
    });
  })

  client.on('end', () => {
    console.log('Disconnected from server');
  });

  client.on('error', (err) => {
    console.log(err);  // Check what this is
    console.log(typeof err);  // Check type
    console.log(err.message);  // Might be undefined
  });

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
