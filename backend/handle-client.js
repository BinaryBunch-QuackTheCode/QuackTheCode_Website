
import { requestCodeExecution } from './executor-comms.js';
import { leetcodeQuestion } from './leetcode.js';
import { startTimerToScreen , generateUniquePin } from './game-utils.js';


/* Return the function callback to be used when a user socket is created 
 */
const getClientConnectionHandler = (executor, io, pendingCallbacks) => {

  /* Handle Global State here */ 

  /* Room: pin -> 
   * {
   *  players: list
   *  roundDuration: int
   *  questions: list
   *  hostId: str
   *  }
   *
   */ 
  const rooms = {};  

  return async (socket) => {
    console.log('User Connected:', socket.id); //users get given a random id when they get connect



    /* --------------------- Create a pin for the game ---------------- */ 

    socket.on('create-pin', (callback) => {
      const pin = generateUniquePin(rooms);
      socket.pin = pin;

      // players: list[{id, role, name}]
      rooms[pin] = {
        players: [], 
        roundDuration: 0, 
        questions: [], 
        hostId: null, 
        gameStartTime: null,
        numSucceeded: 0,
        roundNum: 0,
        gameTimeoutId: null
      };  
      socket.join(pin);
      callback(pin);  // Send PIN back to the host that requested it
    });




    /* -------------------- Switch screens --------------------- */ 

    socket.on('switch-screen', (pin, screen) => {
      if (rooms[pin].hostId === socket.id) {
        io.to(pin).emit('set-page', {screen: screen});
      } else {
        console.error(`User with id ${socket.id} attempted to switch screens with invalid permission`);
      }
    });




    /* -------------------- Create Game ---------------------- */ 

    socket.on('create-game', (roundDuration, name, pin, callback) => {

      rooms[pin].players.push({ id: socket.id, role: 'host', name, results: [] });
      rooms[pin].roundDuration = roundDuration;
      rooms[pin].questions = leetcodeQuestion[Math.floor(Math.random() * leetcodeQuestion.length)];
      rooms[pin].hostId = socket.id; 

      console.log('Created new game with PIN: ', pin);
      callback('host');
      const room = io.sockets.adapter.rooms.get(pin);
      const playerCount = room ? room.sizS : 0;
      io.to(pin).emit('player-count', playerCount);
      io.to(pin).emit('lobby-names', rooms[pin].players);
    });
    



    /* --------------------- Check Pin ------------------ */ 

    socket.on('check-pin', (candidatePin, callback) => {
      const isValid = candidatePin in rooms; 
      if (!isValid) { 
        socket.emit('game-error', `Room with pin ${candidatePin} does not exist`);
      }
      console.log(`Socket ${socket.id} inputed a ${isValid} pin`);
      callback(isValid);
    })



    /* ------------------ Join Game ------------------------ */ 

    socket.on('join-game', (pin, name, callback) => {
      if (!rooms[pin]) {
        socket.emit('game-error', `Room with pin ${pin} does not exist`)
        callback(false);
        console.error('Player tried to join game that does not exist');
        return;
      }
      for (const player of rooms[pin].players) { 
        if (player.name === name) { 
          socket.emit('game-error', `Name ${name} already exists in room`);
          callback(false);
          console.error('Player tried to join game with duplicate name');
          return;
        }
      }
      socket.join(pin);
      rooms[pin].players.push({ id: socket.id, role: 'player', name, results: [] });
      socket.pin = pin;
      const room = io.sockets.adapter.rooms.get(pin)
      const playerCount = room ? room.size : 0;
      io.to(pin).emit('player-count', playerCount);
      io.to(pin).emit('lobby-names', rooms[pin].players);
      callback(true);
    });



    /* ------------------------- Start Game ------------------------ */ 

    socket.on('start-game', (pin) => {
      console.log(rooms[pin]);
      console.log('Host ID: ' + rooms[pin].hostId); 
      console.log('Player ID: ' + socket.id); 

      if (rooms[pin].hostId === socket.id) { 
        io.to(pin).emit('players-remaining', rooms[pin].players.length);
        rooms[pin].numSucceeded = 0;
        rooms[pin].roundNum++; 
        io.to(pin).emit('get-questions', rooms[pin].questions)
        const roundTime = rooms[pin].roundDuration
        console.log('round time: ', roundTime)
        const minute = roundTime * 1000

        // Previer -> Game -> Scoreboard 
        io.to(pin).emit('set-page', {screen: 'preview'}); 

        rooms[pin].gameStartTime = Date.now();

        startTimerToScreen(io, 1000, pin, 'game');
        rooms[pin].gameTimeoutId = startTimerToScreen(io, minute, pin, 'scoreboard', () => {
          io.to(pin).emit('score-results', {
            players: rooms[pin].players
          });
        });

      } else {
        console.error(`User with socket id ${socket.id} attempted to start game with invalid permission`);
      }
    })




    /* ---------------------------- User Submission ------------------------- */ 

    socket.on('user-submission', (code, callback) => {
      const pin = socket.pin;
      console.log(`Received code submission from ${socket.id} in room ${pin}, sending to executor...`);
      // Store callback so we can call it when executor responds

      const onResult = (message) => {
        let succeeded = true; 
        let avgCpuTimeMs = 0; 
        if (message.status !== 'ERROR') {
          for (const result of message.results) { 
            if (!result.succeeded) { 
              succeeded = false; 
              break;
            }
            avgCpuTimeMs += result.cpu_time_ms; 
          }
          if (message.results.length > 0) { 
            avgCpuTimeMs /= message.results.length; 
          }
        }
        callback(message);
        if (succeeded) { 
          rooms[pin].numSucceeded++;
          for (const player of rooms[pin].players) { 
            if (player.id === socket.id) { 
              console.log(message);
              player.results.push({
                succeeded,
                avgCpuTimeMs,
                submissionTimeMs: Date.now() - rooms[pin].gameStartTime
              })
              break;
            }
          }

          if (rooms[pin].players.length === rooms[pin].numSucceeded) { 
            console.log('Clearing timout id: ', rooms[pin].gameTimeoutId);
            clearTimeout(rooms[pin].gameTimeoutId);
            io.to(pin).emit('score-results', rooms[pin].players);
            io.to(pin).emit('set-page', {screen: 'scoreboard'});  
          } else {
            socket.emit('set-page', {screen: 'submitted'});
            io.emit('players-remaining', rooms[pin].players.length - rooms[pin].numSucceeded);
          }
        }
      }
    
      pendingCallbacks.set(socket.id, {callback: onResult, inputs_code: rooms[pin].questions.io});
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

      if(!rooms[pin]) {
        console.log('Room with pin: ', pin,' does not exist');
        return;
      }

      // Delete room if host leaves  
      if (!rooms[pin].hostId || socket.id === rooms[pin].hostId) { 
        console.log("Deleting room");
        io.to(pin).emit('set-page', {screen: 'login'});
        io.to(pin).emit('game-error', "The host has left the game")
        delete rooms[pin];
        return;
      }

      rooms[pin].players = rooms[pin].players.filter((player) => socket.id !== player.id);
      const room_len = io.sockets.adapter.rooms.get(pin);
      const playerCount = room_len ? room_len.size : 0;
      io.to(pin).emit('player-count', playerCount);
      io.to(pin).emit('lobby-names', rooms[pin].players);

    })
  }
}

export { getClientConnectionHandler } 


