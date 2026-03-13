-- QuackTheCode Database Schema
-- Each row maps directly to a question object from leetcode.js

CREATE DATABASE IF NOT EXISTS quackthecode;
USE quackthecode;

DROP TABLE IF EXISTS questions;

CREATE TABLE questions (
    id              INT PRIMARY KEY,                          -- LeetCode problem number (e.g. 1, 242)
    title           VARCHAR(255) NOT NULL,                    -- e.g. "Two Sum"
    question        TEXT NOT NULL,                            -- full problem description
    difficulty      ENUM('Easy','Medium','Hard') NOT NULL,    -- difficulty level
    func_def        TEXT NOT NULL,                            -- Python function signature
    test_func       TEXT NOT NULL,                            -- test runner code
    company_tags    JSON NOT NULL,                            -- ["Google", "Amazon", ...]
    examples        JSON NOT NULL,                            -- [{input: "...", output: "..."}, ...]
    io              JSON NOT NULL,                            -- ["nums = [3,2,4]\ntarget = 6\noutput = [1,2]"]
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
