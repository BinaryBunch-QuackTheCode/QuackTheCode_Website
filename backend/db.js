import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
});

export const getRandomQuestion = async () => {
  const [questions] = await pool.query(
    'SELECT * FROM questions ORDER BY RAND() LIMIT 1'
  );
  const q = questions[0];

  const [examples] = await pool.query(
    'SELECT input_text, output_text FROM question_examples WHERE question_id = ? ORDER BY sort_order',
    [q.id]
  );

  const [testCases] = await pool.query(
    'SELECT io_code FROM question_test_cases WHERE question_id = ?',
    [q.id]
  );

  const [companyRows] = await pool.query(
    `SELECT c.name FROM companies c
     JOIN question_company_tags qct ON c.id = qct.company_id
     WHERE qct.question_id = ?`,
    [q.id]
  );

  return {
    id: q.id,
    title: q.title,
    question: q.question,
    difficulty: q.difficulty,
    func_def: q.func_def,
    test_func: q.test_func,
    example: examples.map(e => ({ input: e.input_text, output: e.output_text })),
    io: testCases.map(tc => tc.io_code),
    company_tags: companyRows.map(r => r.name),
  };
};

export default pool;
