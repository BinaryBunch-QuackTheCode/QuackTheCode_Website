-- Seed data: insert the two questions from leetcode.js
USE quackthecode;

INSERT INTO questions (id, title, question, difficulty, func_def, test_func, company_tags, examples, io)
VALUES
(
    1,
    'Two Sum',
    'Given an array of integers nums and an integer target, return the indices i and j such that nums[i] + nums[j] == target and i != j. \n\nYou may assume that every input has exactly one pair of indices i and j that satisfy the condition. \n\nReturn the answer with the smaller index first.',
    'Easy',
    'def twoSum(nums: list[int], target: int) -> list[int]:',
    'import sys\nif twoSum(nums, target) != output:\n\tsys.exit(1)\nsys.exit(0)',
    '["Google", "Amazon", "Microsoft", "Meta", "Apple", "Adobe", "Bloomberg", "Spotify", "Goldman Sachs", "Uber", "LinkedIn"]',
    '[{"input": "Input: nums = [3,4,5,6], target = 7", "output": "Output: [0,1]"}, {"input": "Input: nums = [5,5], target = 10", "output": "Output: [0,1]"}, {"input": "Input: nums = [4,5,6], target = 10", "output": "Output: [0,2]"}]',
    '["nums = [3, 2, 4]\\ntarget = 6\\noutput = [1, 2]"]'
),
(
    242,
    'Valid Anagram',
    'Given an array of integers nums and an integer target, return the indices i and j such that nums[i] + nums[j] == target and i != j. \n\nYou may assume that every input has exactly one pair of indices i and j that satisfy the condition. \n\nReturn the answer with the smaller index first.',
    'Easy',
    'def isAnagram(s: str, t: str) -> bool:',
    'import sys\nif isAnagram(s, t) != output:\n\tsys.exit(1)\nsys.exit(0)',
    '["Meta", "Google", "Amazon", "Microsoft", "Uber", "Bloomberg"]',
    '[{"input": "s = \"racecar\", t = \"carrace\"", "output": "Output: True"}, {"input": "Input: s = \"jar\", t = \"jam\"", "output": "Output: False"}]',
    '["s=\"racecar\"\\nt=\"carrace\"\\noutput = True"]'
);
