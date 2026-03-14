export const leetcodeQuestion = [
    {
        question: 
        'Given an array of integers nums and an integer target, return the indices i and j such that nums[i] + nums[j] == target and i != j. \n\nYou may assume that every input has exactly one pair of indices i and j that satisfy the condition. \n\nReturn the answer with the smaller index first.',
        title: 'Two Sum',
        example: [{input: 'Input: nums = [3,4,5,6], target = 7', output: 'Output: [0,1]'}, {input: 'Input: nums = [5,5], target = 10', output: 'Output: [0,1]'}, {input: 'Input: nums = [4,5,6], target = 10', output: 'Output: [0,2]'}],
        id: 1,
        difficulty: 'Easy',
        company_tags: ['Google', 'Amazon', 'Microsoft', 'Meta', 'Apple', 'Adobe', 'Bloomberg', 'Spotify', 'Goldman Sachs', 'Uber', 'LinkedIn'],
        func_def: 'def twoSum(nums: list[int], target: int) -> list[int]:',
        test_func:'import sys\nif twoSum(nums, target) != output:\n\tsys.exit(1)\nsys.exit(0)',
        io: ['nums = [3, 2, 4]\ntarget = 6\noutput = [1, 2]'],
    },
    {
        question: 
        'Given two strings s and t, return true if t is an anagram of s, and false otherwise.\n\nAn anagram is a word or phrase formed by rearranging the letters of a different word or phrase, using all the original letters exactly once.',
        title: 'Valid Anagram',
        example: [{input: 's = "racecar", t = "carrace', output: 'Output: True'}, {input: 'Input: s = "jar", t = "jam', output: 'Output: False'}],
        id: 242,
        difficulty: 'Easy', 
        company_tags: ['Meta', 'Google', 'Amazon', 'Microsoft', 'Uber', 'Bloomberg'],
        func_def: 'def isAnagram(s: str, t: str) -> bool:',
        test_func:'import sys\nif isAnagram(s, t) != output:\n\tsys.exit(1)\nsys.exit(0)',
        io: ['s="racecar"\nt="carrace"\noutput = True'],
    },
    {
        question:
        'You are given an array prices where prices[i] is the price of a given stock on the ith day.\n\nYou want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.\n\nReturn the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.',
        title: 'Best Time to Buy and Sell Stock',
        example: [{input: 'prices = [7,1,5,3,6,4]', output: '5'}, {input: 'prices = [7,6,4,3,1]', output: '0'}],
        id: 121,
        difficulty: 'Easy',
        company_tags: ['Amazon', 'Google', 'Microsoft', 'Meta', 'Apple', 'Bloomberg', 'Adobe', 'Goldman Sachs'],
        func_def: 'def maxProfit(prices: list[int]) -> int:',
        test_func: 'import sys\nif maxProfit(prices) != output:\n\tsys.exit(1)\nsys.exit(0)',
        io: ['prices = [7,1,5,3,6,4]\noutput = 5'],
    },
    {
        question:
        'A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Alphanumeric characters include letters and numbers.\n\nGiven a string s, return true if it is a palindrome, or false otherwise.',
        title: 'Valid Palindrome',
        example: [{input: 's = "A man, a plan, a canal: Panama"', output: 'True'}, {input: 's = "race a car"', output: 'False'}, {input: 's = " "', output: 'True'}],
        id: 125,
        difficulty: 'Easy',
        company_tags: ['Facebook', 'Apple', 'Microsoft', 'Amazon', 'Google', 'Bloomberg'],
        func_def: 'def isPalindrome(s: str) -> bool:',
        test_func: 'import sys\nif isPalindrome(s) != output:\n\tsys.exit(1)\nsys.exit(0)',
        io: ['s="A man, a plan, a canal: Panama"\noutput = True'],
    },
    {
        question:
        'Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.\n\nNotice that the solution set must not contain duplicate triplets.',
        title: '3Sum',
        example: [{input: 'nums = [-1,0,1,2,-1,-4]', output: '[[-1,-1,2],[-1,0,1]]'}, {input: 'nums = [0,1,1]', output: '[]'}, {input: 'nums = [0,0,0]', output: '[[0,0,0]]'}],
        id: 15,
        difficulty: 'Medium',
        company_tags: ['Amazon', 'Google', 'Microsoft', 'Meta', 'Apple', 'Bloomberg', 'Adobe', 'Uber'],
        func_def: 'def threeSum(nums: list[int]) -> list[list[int]]:',
        test_func: 'import sys\nif sorted(threeSum(nums)) != sorted(output):\n\tsys.exit(1)\nsys.exit(0)',
        io: ['nums = [-1,0,1,2,-1,-4]\noutput = [[-1,-1,2],[-1,0,1]]'],
    },
]

