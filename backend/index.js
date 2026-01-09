import express from 'express';
import { leetcodeQuestion } from './leetcode.js'
import cors from 'cors'; 

const app = express();

const PORT = 3000;

app.use(express.json());
app.use(cors({origin: 'http://localhost:5173'}));

app.post('/submit', (req, res) => {
  const {code} = req.body;
  console.log(code);
  res.json({ message: 'Hello from the backend!' });
});

app.get('/get_questions', (req, res) => {
    res.json(leetcodeQuestion)
})
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});