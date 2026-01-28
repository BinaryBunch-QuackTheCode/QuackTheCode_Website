import express from 'express';
import { leetcodeQuestion } from './leetcode.js';
import cors from 'cors';
import { Server } from 'socket.io';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import net from 'net';
import { setExecutorOnMessage, requestCodeExecution } from './executor-comms.js';


// Create __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://44.251.240.201:3000'],
    methods: ['GET', 'POST']
  }
});
const PORT = 3000;
/* 
  IO: The whole server (all connected clients)
  Socket: The current client
*/
const executor = net.createConnection('/tmp/executor.sock');

// Set up the message handler ONCE at startup
setExecutorOnMessage(executor, (message) => {
  console.log('Received from executor:', message);
  // TODO: send result back to the right client
});

executor.on('end', () => {
  console.log('Disconnected from executor');
});

executor.on('error', (err) => {
  console.error('Socket error:', err.message);
});

const rooms = {}

// Generate a unique 6-digit PIN
function generateUniquePin() {
  let pin;
  do {
    pin = Math.floor(100000 + Math.random() * 900000).toString();
  } while (rooms[pin]); // Keep generating until we find an unused PIN
  return pin;
}

io.on('connection', async (socket) => { //runs everytime a client connects to the server and gives a socket instance to them
  console.log('User Connected:', socket.id); //users get given a random id when they get connect
  // Host requests a new unique game PIN
  socket.on('create-game', (callback) => {
    const pin = generateUniquePin();
    rooms[pin] = [];  // Reserve it immediately
    console.log('Created new game with PIN:', pin);
    callback(pin);  // Send PIN back to the host that requested it
  });
  socket.on('check-pin', (candidatePin, callback) => {
    const isValid = candidatePin in rooms; 
    console.log(`Socket ${socket.id} inputted a ${isValid} pin`)
    callback(isValid);
  })
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

  socket.on('user-submission', (code, callback) => {
    console.log(`Received code submission from ${socket.id} in room ${socket.pin}, sending to executor...`);
    requestCodeExecution(executor, {
      player_id: socket.id,
      game_id: Number(socket.pin), 
      user_code: code, 
      inputs_code: [""],
      test_code: "",
    });
    setExecutorOnMessage(executor, (message) => {
      callback(message); 
    })
  })

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
    if (rooms[pin].length === 0) {
      delete rooms[pin]
    }
  })

})

app.use(express.json());
app.use(cors());

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend/dist')));

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