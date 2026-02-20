
// Generate a unique 6-digit PIN
const generateUniquePin = (rooms) => {
  let pin;
  do {
    pin = Math.floor(100000 + Math.random() * 900000).toString();
  } while (rooms[pin]); // Keep generating until we find an unused PIN
  return pin;
}

const gameTimer = (io, minute, pin, nextScreen) => {
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

export { generateUniquePin, gameTimer };

