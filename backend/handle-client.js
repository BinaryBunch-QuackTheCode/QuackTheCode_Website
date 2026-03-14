
import { requestCodeExecution } from './executor-comms.js';
import { getRandomQuestion } from './db.js';
import { startTimerToScreen, generateUniquePin } from './game-utils.js';


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

    const cleanupPlayerFromRoom = () => {
      const pin = socket.pin;
      if (!pin) {
        console.log('No pin found for socket');
        return;
      }
      if (!rooms[pin]) {
        console.log('Room with pin:', pin, 'does not exist');
        return;
      }

      if (!rooms[pin].hostId || socket.id === rooms[pin].hostId) {
        console.log('Host leaving — deleting room', pin);
        io.to(pin).emit('set-page', { screen: 'login' });
        io.to(pin).emit('game-error', 'The host has left the game');
        if (rooms[pin].gameTimeoutId !== null) {
          clearTimeout(rooms[pin].gameTimeoutId);
        }
        delete rooms[pin];
      } else {
        rooms[pin].players = rooms[pin].players.filter((p) => p.id !== socket.id);
        const room = io.sockets.adapter.rooms.get(pin);
        const playerCount = room ? room.size - 1 : 0;
        io.to(pin).emit('player-count', playerCount);
        io.to(pin).emit('lobby-names', rooms[pin].players);
      }

      socket.leave(pin);
      socket.pin = null;
    };



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
        io.to(pin).emit('set-page', { screen: screen });
      } else {
        console.error(`User with id ${socket.id} attempted to switch screens with invalid permission`);
      }
    });




    /* -------------------- Create Game ---------------------- */

    socket.on('create-game', (roundDuration, name, pin, callback) => {

      rooms[pin].players.push({ id: socket.id, role: 'host', name, results: [], points: 0, characterIndex: null });
      rooms[pin].roundDuration = roundDuration;
      rooms[pin].hostId = socket.id;

      console.log('Created new game with PIN: ', pin);
      callback('host');
      const room = io.sockets.adapter.rooms.get(pin);
      const playerCount = room ? room.size : 0;
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
      rooms[pin].players.push({ id: socket.id, role: 'player', name, results: [], points: 0, characterIndex: null });
      socket.pin = pin;
      const room = io.sockets.adapter.rooms.get(pin)
      const playerCount = room ? room.size : 0;
      io.to(pin).emit('player-count', playerCount);
      io.to(pin).emit('lobby-names', rooms[pin].players);
      callback(true);
    });


    /* ------------------ Select Character ------------------ */

    socket.on('select-character', (characterIndex) => {
      const pin = socket.pin;
      if (!pin || !rooms[pin]) return;

      const players = rooms[pin].players;

      // prevent duplicate character picks
      const alreadyTaken = players.some(
        (p) => p.id !== socket.id && p.characterIndex === characterIndex
      );

      if (alreadyTaken) {
        socket.emit('game-error', 'Character already taken');
        return;
      }

      // assign character to player
      const player = players.find((p) => p.id === socket.id);
      if (!player) return;

      player.characterIndex = characterIndex;

      // update lobby for everyone
      io.to(pin).emit('lobby-names', players);
    });


    /* ------------------------- Start Game ------------------------ */

    socket.on('start-game', async (pin) => {
      console.log(rooms[pin]);
      console.log('Host ID: ' + rooms[pin].hostId);
      console.log('Player ID: ' + socket.id);

      if (rooms[pin].hostId === socket.id) {
        try {
          rooms[pin].questions = await getRandomQuestion();
        } catch (err) {
          console.error('Failed to fetch question from DB:', err.message);
          socket.emit('game-error', 'Failed to load question from database');
          return;
        }

        io.to(pin).emit('players-remaining', rooms[pin].players.length);
        rooms[pin].numSucceeded = 0;
        rooms[pin].roundNum++;
        io.to(pin).emit('get-questions', rooms[pin].questions)
        const roundTime = rooms[pin].roundDuration
        console.log('round time: ', roundTime)
        const minute = roundTime * 1000

        rooms[pin].gameStartTime = Date.now();

        io.to(pin).emit('set-page', { screen: 'game' });
        rooms[pin].gameTimeoutId = startTimerToScreen(io, minute, pin, 'scoreboard', () => {
          rooms[pin].players.forEach(player => {
            // mark unfinished players as failed
            if (player.results.length !== rooms[pin].roundNum) {
              player.results.push({
                succeeded: false,
                avgCpuTimeMs: null,
                submissionTimeMs: null
              });
            }
            rooms[pin].gameTimeoutId = null;
          });

          io.to(pin).emit('score-results', rooms[pin].players);
        });

      } else {
        console.error(`User with socket id ${socket.id} attempted to start game with invalid permission`);
      }
    })


    /* ----------------- Back to lobby ------------- */

    socket.on('back-to-lobby', (pin) => {
      // reset game state
      rooms[pin].roundNum = 0;
      rooms[pin].players.forEach(player => {
        player.results = [];
        player.points = 0;
        player.characterIndex = null;
      })
      io.to(pin).emit('set-page', { screen: 'lobby' });
    });


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
              const submissionTimeMs = Date.now() - rooms[pin].gameStartTime;
              player.results.push({
                succeeded,
                avgCpuTimeMs,
                submissionTimeMs
              });
              player.points += 1000 - Math.round(avgCpuTimeMs / 1000) - Math.round(submissionTimeMs / 1000);
              break;
            }
          }

          if (rooms[pin].players.length === rooms[pin].numSucceeded) {
            clearTimeout(rooms[pin].gameTimeoutId);
            rooms[pin].gameTimeoutId = null;
            io.to(pin).emit('score-results', rooms[pin].players);
            io.to(pin).emit('set-page', { screen: 'scoreboard' });
          } else {
            socket.emit('set-page', { screen: 'submitted' });
            io.emit('players-remaining', rooms[pin].players.length - rooms[pin].numSucceeded);
          }
        }
      }

      pendingCallbacks.set(socket.id, { callback: onResult, inputs_code: rooms[pin].questions.io });
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
      pendingCallbacks.set(socket.id, { callback, inputs_code: rooms[pin].questions.io });
      requestCodeExecution(executor, {
        player_id: socket.id,
        game_id: Number(pin) || 1,
        user_code: code,
        inputs_code: rooms[pin].questions.io.slice(0, 3),
        test_code: rooms[pin].questions.test_func,
      });
    })


    /* ---------------------------- Leave Game ------------------------- */

    socket.on('leave-game', () => {
      console.log(`Socket ${socket.id} is leaving the game`);
      cleanupPlayerFromRoom();
    });


    /* ---------------------------- Disconnect------------------------- */

    socket.on('disconnect', (reason) => {
      console.log(`${socket.id} disconnected because of: ${reason}`);
      cleanupPlayerFromRoom();
    })
  }
}

export { getClientConnectionHandler }


