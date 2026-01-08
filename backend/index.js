const express = require('express');
const cors = require('cors');
const app = express();

const PORT = 3000;

app.use(express.json());
app.use(cors({origin: 'http://localhost:5173' }))

app.get('/', (req, res) => {
  res.json({ message: 'Hello from the backend!' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});