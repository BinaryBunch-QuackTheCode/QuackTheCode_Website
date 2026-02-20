
import { requestCodeExecution } from './executor-comms.js';
import { leetcodeQuestion } from './leetcode.js';
import { startTimerToScreen , generateUniquePin } from './game-utils.js';

/* Return the function callback to be used when a user socket is created 
 */
const getClientConnectionHandler = (executor, io, pendingCallbacks) => {
  return async (socket) => {
    console.log('User Connected:', socket.id); //users get given a random id when they get connect

    const rooms = {}; // Pin -> list of players 


    /* --------------------- Create a pin for the game ---------------- */ 
    socket.on('create-pin', (callback) => {
      const pin = generateUniquePin(rooms);
      socket.pin = pin;

      // players: list[{id, role, name}]
      rooms[pin] = {players: [], roundDuration: 0, questions: []};  // Reserve it immediately
      socket.join(pin);
      callback(pin);  // Send PIN back to the host that requested it
      console.log(rooms[pin].players);
    });

    /* -------------------- Switch screens --------------------- */ 

    socket.on('switch-screen', (pin, screen) => {
      io.to(pin).emit('set-page', {screen: screen});
    });


    /* -------------------- Create Game ---------------------- */ 
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
    
    /* --------------------- Check Pin ------------------ */ 
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

    /* ------------------------- Start Game ------------------------ */ 
    socket.on('start-game', (pin) => {
      io.to(pin).emit('get-questions', rooms[pin].questions)
      const roundTime = rooms[pin].roundDuration
      console.log('round time: ', roundTime)
      const minute = roundTime * 1000
      rooms[pin].players.forEach((obj) => {
        if(obj.id === socket.id && obj.role === 'host')
          io.to(pin).emit('set-page', {screen: 'preview'}); //question preview
          startTimerToScreen(io, 1000, pin, 'game');
          startTimerToScreen(io, minute, pin, 'scoreboard');
        })
    })

    /* ---------------------------- User Submission ------------------------- */ 
    socket.on('user-submission', (code, callback) => {
      const pin = socket.pin;
      console.log(`Received code submission from ${socket.id} in room ${pin}, sending to executor...`);
      // Store callback so we can call it when executor responds
      pendingCallbacks.set(socket.id, {callback, inputs_code: rooms[pin].questions.io});
      requestCodeExecution(executor, {
        player_id: socket.id,
        game_id: Number(pin) || 1,
        user_code: code,
        inputs_code: rooms[pin].questions.io, 
        test_code: rooms[pin].questions.test_func,
      });
    })

    /* ---------------------------- User Run------------------------- */ 
    socket.on('user-run', (code, callback) => {
      const pin = socket.pin;
      console.log(`Received code run from ${socket.id} in room ${pin}, sending to executor...`);
      // Store callback so we can call it when executor responds
      pendingCallbacks.set(socket.id, {callback, inputs_code: rooms[pin].questions.io});
      requestCodeExecution(executor, {
        player_id: socket.id,
        game_id: Number(pin) || 1,
        user_code: code,
        inputs_code: rooms[pin].questions.io.slice(0, 3), 
        test_code: rooms[pin].questions.test_func,
      });
    })


    /* ---------------------------- Disconnect------------------------- */ 
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
  }
}

export { getClientConnectionHandler } 


