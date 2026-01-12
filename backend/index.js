import express from 'express';
import { leetcodeQuestion } from './leetcode.js'
import cors from 'cors'; 
import { Socket } from 'socket.io';
import { createServer} from 'http';

const app = express();

const PORT = 3000;

app.use(express.json());
app.use(cors({origin: 'http://localhost:5173'}));
app.use(express.static(path.join(__dirname, '../frontend/dist')));

app.post('/submit', (req, res) => {
  const {code} = req.body;
  console.log(code);
  res.json({ message: 'Hello from the backend!' });
});

app.get('/get_questions', (req, res) => {
  /* 
  for(let i = 0; i < 5; i ++){
    console.log(Math.floor(Math.random() * leetcodeQuestion.length));
  }
  */ 
  res.json(leetcodeQuestion[Math.floor(Math.random() * leetcodeQuestion.length)]);
})

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});