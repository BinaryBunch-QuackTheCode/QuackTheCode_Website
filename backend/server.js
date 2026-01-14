// test-server.js
import net from 'net';

const PORT = 3001;

const server = net.createServer((socket) => {
  console.log('✅ Client connected');
  
  let buffer = '';
  
  socket.on('data', (chunk) => {
    buffer += chunk.toString();
    let lines = buffer.split('\n');
    buffer = lines.pop();
    
    for (let line of lines) {
      if (!line) continue;
      
      console.log('📨 Received:', line);
      
      try {
        const request = JSON.parse(line);
        console.log('   Player ID:', request.player_id);
        console.log('   Code:', request.user_code);
        
        // Mock response (like your C++ would send)
        const response = {
          success: true,
          output: "hello world\n",
          execution_time: 123
        };
        
        const payload = JSON.stringify(response) + '\n';
        socket.write(payload);
        console.log('📤 Sent response:', payload.trim());
        
      } catch (err) {
        console.error('❌ Invalid JSON:', err.message);
      }
    }
  });
  
  socket.on('end', () => {
    console.log('👋 Client disconnected');
  });
  
  socket.on('error', (err) => {
    console.error('❌ Socket error:', err.message);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Test server listening on port ${PORT}`);
  console.log(`   Run your client in another terminal\n`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
    console.error('   Kill the process or use a different port');
  } else {
    console.error('❌ Server error:', err.message);
  }
  process.exit(1);
});