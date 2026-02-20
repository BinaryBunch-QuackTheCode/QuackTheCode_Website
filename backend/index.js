import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io'
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import net from 'net';
import { setExecutorOnMessage } from './executor-comms.js';
import { getClientConnectionHandler } from './handle-client.js';


// Create __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

/* Setupt handeling of executions, executin callbacks to send the message to the user 
 *
 */
const setupExecution = (executor, pendingCallbacks) => {
  setExecutorOnMessage(executor, (message) => {
    console.log('Received from executor:', message);
    
    // Find the callback for this player and call it
    const cbResource = pendingCallbacks.get(message.player_id);
    if (cbResource) {
      message.inputs_code = cbResource.inputs_code; 
      cbResource.callback(message);
      pendingCallbacks.delete(message.player_id);  // Clean up
    }
  });

  executor.on('end', () => {
    console.log('Disconnected from executor');
  });

  executor.on('error', (err) => {
    console.error('Socket error:', err.message);
  });
}


const main = () => {

  const app = express(); 
  const server = createServer(app);

  /* 
    IO: The whole server (all connected clients)
    Socket: The current client
  */
  const io = new Server(server, {
    cors: {
      origin: ['http://localhost:5173', 'http://44.251.240.201:3000'],
      methods: ['get', 'post']
    }
  })

  const executor = net.createConnection('/tmp/executor.sock');

  // Track pending callbacks: player_id -> callback: callback function, inputs_code: inputed code for tests
  const pendingCallbacks = new Map();

  setupExecution(executor, pendingCallbacks);

  io.on('connection', getClientConnectionHandler(executor, io, pendingCallbacks));

  app.use(express.json());

  app.use(cors());

  // Serve frontend static files
  app.use(express.static(path.join(__dirname, '../frontend/dist')));

  // Catch-all: serve React app for any other routes (must be LAST)
  app.get('/{*splat}', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
  });

  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

main(); 



