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

// Track pending callbacks: player_id -> callback function
const pendingCallbacks = new Map();
// Set up the message handler once at startup so its always listening
setExecutorOnMessage(executor, (message) => {
  console.log('Received from executor:', message);
  
  // Find the callback for this player and call it
  const callback = pendingCallbacks.get(message.player_id);
  if (callback) {
    message.inputs_code = callback.inputs_code; 
    callback(message);
    pendingCallbacks.delete(message.player_id);  // Clean up
  }
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

function gameTimer(minute, pin, nextScreen){
  /* 
    Checks if there are still questions left. if none then break. 
    if there are still questions then go through each question
  */
  setTimeout(() => {
    io.to(pin).emit('set-page', {screen: nextScreen}); //after set amount of time show editor
  }, minute);
  const now = Date.now();
  const endTime = now + minute;
  io.to(pin).emit('get-time', endTime, minute / 1000);
}

io.on('connection', async (socket) => { //runs everytime a client connects to the server and gives a socket instance to them
  console.log('User Connected:', socket.id); //users get given a random id when they get connect
  // Host requests a new unique game PIN
  socket.on('create-pin', (callback) => {
    const pin = generateUniquePin();
    socket.pin = pin;
    rooms[pin] = {players: []};  // Reserve it immediately
    socket.join(pin);
    callback(pin);  // Send PIN back to the host that requested it
    console.log(rooms[pin].players);
  });

  socket.on('end-game', (pin) => {
    io.to(pin).emit('set-page', {screen: 'podium'});
  });
  
  socket.on('create-game', (roundDuration, name, pin, callback) => {
    rooms[pin].players.push({ id: socket.id, role: 'host', name});
    rooms[pin].roundDuration = roundDuration;
    rooms[pin].questions = leetcodeQuestion[Math.floor(Math.random() * leetcodeQuestion.length)];
    console.log('Created new game with PIN:', pin);
    callback('host');
    const room = io.sockets.adapter.rooms.get(pin);
    const playerCount = room ? room.size : 0;
    io.to(pin).emit('player-count', playerCount);
    io.to(pin).emit('lobby-names', rooms[pin].players);
  });
  
  socket.on('check-pin', (candidatePin, callback) => {
    const isValid = candidatePin in rooms; 
    console.log(`Socket ${socket.id} inputted a ${isValid} pin`);
    callback(isValid);
  })

  socket.on('join-game', (pin, name) => {
    socket.join(pin);
    if (!rooms[pin]) {
      rooms[pin] = [];
    }
    rooms[pin].players.push({ id: socket.id, role: 'player', name});
    socket.pin = pin;
    const room = io.sockets.adapter.rooms.get(pin)
    const playerCount = room ? room.size : 0;
    io.to(pin).emit('player-count', playerCount);
    io.to(pin).emit('lobby-names', rooms[pin].players);
    console.log(`${name} joined. Players in room ${pin}: ${playerCount}`);
    console.log('Rooms: ', rooms)
  });

  socket.on('start-game', (pin) => {
    io.to(pin).emit('get-questions', rooms[pin].questions)
    const roundTime = rooms[pin].roundDuration
    console.log('round time: ', roundTime)
    const minute = roundTime * 1000
    rooms[pin].players.forEach((obj) => {
      if(obj.id === socket.id && obj.role === 'host')
       io.to(pin).emit('set-page', {screen: 'preview'}); //question preview
       gameTimer(1000, pin, 'game');
       gameTimer(minute, pin, 'scoreboard');
      })
  })

  socket.on('user-submission', (code, callback) => {
    const pin = socket.pin;
    console.log(`Received code submission from ${socket.id} in room ${pin}, sending to executor...`);
    // Store callback so we can call it when executor responds
    callback.inputs_code = rooms[pin].questions.io;
    pendingCallbacks.set(socket.id, callback);
    requestCodeExecution(executor, {
      player_id: socket.id,
      game_id: Number(pin) || 1,
      user_code: code,
      inputs_code: rooms[pin].questions.io, 
      test_code: rooms[pin].questions.test_func,
    });
  })

  // just for small test cases 
  socket.on('user-run', (code, callback) => {
    const pin = socket.pin;
    console.log(`Received code run from ${socket.id} in room ${pin}, sending to executor...`);
    // Store callback so we can call it when executor responds
    callback.inputs_code = rooms[pin].questions.io;
    pendingCallbacks.set(socket.id, callback);
    requestCodeExecution(executor, {
      player_id: socket.id,
      game_id: Number(pin) || 1,
      user_code: code,
      inputs_code: rooms[pin].questions.io.slice(0, 3), 
      test_code: rooms[pin].questions.test_func,
    });
  })


  socket.on('disconnect', (reason) => {
    console.log(`${socket.id} because of: ${reason}`);
    const pin = socket.pin;
    if (!pin) {
      console.log('No pin found for socket');
      return;
    }
    if(!rooms[pin]){
      console.log('Room with pin: ', pin,' does not exist');
      return;
    }
    rooms[pin].players = rooms[pin].players.filter((player) => socket.id !== player.id);
    const room_len = io.sockets.adapter.rooms.get(pin);
    const playerCount = room_len ? room_len.size : 0;
    io.to(pin).emit('player-count', playerCount);
    io.to(pin).emit('lobby-names', rooms[pin]);
    if (rooms[pin] && rooms[pin].length === 0) {
      delete rooms[pin];
    }
  })
})

app.use(express.json());
app.use(cors());

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend/dist')));

/*
app.get('/get_questions', (req, res) => {
  res.json(leetcodeQuestion[Math.floor(Math.random() * leetcodeQuestion.length)]);
});
*/

// Catch-all: serve React app for any other routes (must be LAST)
app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
