
/* Generate a unique 6-digit PIN
 * rooms: Room obj of pins as keys, to verify uniqueness
 */
const generateUniquePin = (rooms) => {
  let pin;
  do {
    pin = Math.floor(100000 + Math.random() * 900000).toString();
  } while (rooms[pin]); // Keep generating until we find an unused PIN
  return pin;
}


/* 
 * Sets a timer until the next screen
 * Also broadcasts the time to the users, though may not be used 
 *
 * io: Socket server 
 * minute: Number of minutes of timeout 
 * pin: Game pin of lobby
 * next screen: string of next screen to switcch to, matches lobby
 * callback: optional callback to run 
 *
*/
const startTimerToScreen = (io, minute, pin, nextScreen, callback) => {
  const timeoutId = setTimeout(() => {
    io.to(pin).emit('set-page', {screen: nextScreen});
    if (callback) {
      callback();
    }
  }, minute);
  const now = Date.now();
  const endTime = now + minute;
  io.to(pin).emit('get-time', endTime, minute / 1000);
  return timeoutId; 
}

export { generateUniquePin, startTimerToScreen };

