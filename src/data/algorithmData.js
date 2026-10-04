export const navItems = [
  { id: "sorting", label: "Sorting", defaultMode: "sorting" },
  { id: "search", label: "Search", defaultMode: "search" },
  { id: "structures", label: "Structures", defaultMode: "structures" },
  { id: "graphs", label: "Graphs", defaultMode: "graphs" },
  { id: "practice", label: "Practice", defaultMode: "practice", icon: "code" },
];

export const algorithmComplexity = {
  bubble: { name: "Bubble sort", best: "O(n)", average: "O(n^2)", worst: "O(n^2)", space: "O(1)" },
  selection: { name: "Selection sort", best: "O(n^2)", average: "O(n^2)", worst: "O(n^2)", space: "O(1)" },
  insertion: { name: "Insertion sort", best: "O(n)", average: "O(n^2)", worst: "O(n^2)", space: "O(1)" },
  merge: { name: "Merge sort", best: "O(n log n)", average: "O(n log n)", worst: "O(n log n)", space: "O(n)" },
  quick: { name: "Quick sort", best: "O(n log n)", average: "O(n log n)", worst: "O(n^2)", space: "O(log n)" },
  race: { name: "Sorting race", best: "Varies", average: "Compare live", worst: "Compare live", space: "Varies" },
  binary: { name: "Binary search", best: "O(1)", average: "O(log n)", worst: "O(log n)", space: "O(1)" },
  linearSearch: { name: "Linear search", best: "O(1)", average: "O(n)", worst: "O(n)", space: "O(1)" },
  structures: { name: "Structures", best: "O(1)", average: "O(1)", worst: "O(n)", space: "O(n)" },
  tree: { name: "Binary search tree", best: "O(log n)", average: "O(log n)", worst: "O(n)", space: "O(n)" },
  graph: { name: "Graph traversal", best: "O(V + E)", average: "O(V + E)", worst: "O(V + E)", space: "O(V)" },
  dijkstra: { name: "Dijkstra", best: "O(E log V)", average: "O(E log V)", worst: "O(E log V)", space: "O(V)" },
  path: { name: "Grid pathfinding", best: "O(V + E)", average: "O(V + E)", worst: "O(V + E)", space: "O(V)" },
  astar: { name: "A* search", best: "O(E)", average: "O(E log V)", worst: "O(E log V)", space: "O(V)" },
  practice: { name: "Code practice", best: "Run tests", average: "Debug", worst: "Try again", space: "Varies" },
};

export const pseudocode = {
  bubble: [
    "repeat for each array index i",
    "compare adjacent values j and j + 1",
    "swap them when left value is larger",
    "mark the largest unsorted value as fixed",
  ],
  selection: [
    "repeat for each array index i",
    "scan the unsorted suffix for the minimum",
    "compare every candidate with the current minimum",
    "swap the minimum into position i",
  ],
  insertion: [
    "walk from the second item to the end",
    "store the current value as the key",
    "shift larger sorted values one slot right",
    "insert the key into the open position",
  ],
  merge: [
    "split the array into halves",
    "recursively sort each half",
    "merge by taking the smaller front value",
    "copy merged values back into the array",
  ],
  quick: [
    "choose a pivot from the current range",
    "partition smaller values before the pivot",
    "place the pivot in its final position",
    "recursively quicksort both sides",
  ],
  race: [
    "give every algorithm the same array",
    "advance each unfinished algorithm one step",
    "record comparisons, writes, and finish tick",
    "rank algorithms by finish order and work done",
  ],
  binary: [
    "set low to the first index and high to the last",
    "check the middle of the current window",
    "move low right when middle is too small",
    "move high left when middle is too large",
  ],
  linearSearch: [
    "start at the first item",
    "compare the current item with the target",
    "move one item right when it does not match",
    "stop when the target is found or the array ends",
  ],
  structures: [
    "push adds to the top of the stack",
    "pop removes from the top of the stack",
    "enqueue adds to the back of the queue",
    "dequeue removes from the front of the queue",
  ],
  tree: [
    "compare the value with the current node",
    "go left for smaller values",
    "go right for larger values",
    "visit nodes in the selected traversal order",
  ],
  graph: [
    "start from the selected node",
    "visit the next frontier node",
    "inspect each unvisited neighbor",
    "record parent links to show the explored path",
  ],
  path: [
    "place the start node into the frontier",
    "take the next most promising cell",
    "skip walls and relax each neighbor",
    "reconstruct the path from end to start",
  ],
  practice: [
    "read the challenge prompt",
    "write the requested function",
    "run the provided test cases",
    "revise until every case passes",
  ],
};

export const raceSets = {
  classic: ["bubble", "insertion", "merge", "quick"],
  fundamentals: ["bubble", "selection", "insertion"],
  fast: ["insertion", "merge", "quick"],
};

export const practiceChallenges = {
  binarySearch: {
    title: "Binary search",
    difficulty: "Easy",
    topic: "Search",
    entry: "search",
    prompt: "Write search(nums, target). Return the index of target in a sorted array, or -1 when it is missing.",
    constraints: ["nums is sorted in ascending order", "nums contains unique integers", "Return -1 when target is missing"],
    complexity: { time: "O(log n)", space: "O(1)" },
    examples: [
      { input: "nums = [1,3,5,7,9], target = 7", output: "3", note: "7 is at index 3." },
      { input: "nums = [2,4,6,8], target = 5", output: "-1", note: "5 does not exist in the array." },
    ],
    hints: [
      "Keep two pointers: one at the left edge and one at the right edge.",
      "Each comparison should remove half of the remaining search space.",
      "When nums[mid] is smaller than target, move left to mid + 1.",
    ],
    template: `function search(nums, target) {
  let left = 0;
  let right = nums.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    // Write your comparison here
  }

  return -1;
}`,
    tests: [
      { name: "middle hit", group: "Sample", reveal: true, args: [[1, 3, 5, 7, 9], 7], expected: 3 },
      { name: "missing value", group: "Sample", reveal: true, args: [[2, 4, 6, 8, 10], 5], expected: -1 },
      { name: "single item", group: "Edge", reveal: true, args: [[11], 11], expected: 0 },
      { name: "left boundary", group: "Hidden", reveal: false, args: [[-8, -3, 0, 4, 9, 12, 15], -8], expected: 0 },
      { name: "right boundary", group: "Hidden", reveal: false, args: [[-8, -3, 0, 4, 9, 12, 15], 15], expected: 6 },
    ],
  },
  twoSum: {
    title: "Two sum",
    difficulty: "Easy",
    topic: "Hash Map",
    entry: "twoSum",
    prompt: "Write twoSum(nums, target). Return the indices of two numbers that add up to target.",
    constraints: ["Exactly one valid answer exists", "Do not use the same element twice", "Return the pair in discovery order"],
    complexity: { time: "O(n)", space: "O(n)" },
    examples: [
      { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", note: "2 + 7 equals 9." },
      { input: "nums = [3,2,4], target = 6", output: "[1,2]", note: "2 + 4 equals 6." },
    ],
    hints: [
      "A nested loop works, but the target complexity is linear.",
      "For each number, compute the complement: target - nums[i].",
      "Store seen values with their indices in a Map.",
    ],
    template: `function twoSum(nums, target) {
  const seen = new Map();

  for (let i = 0; i < nums.length; i += 1) {
    // Write your lookup here
  }

  return [];
}`,
    tests: [
      { name: "classic pair", group: "Sample", reveal: true, args: [[2, 7, 11, 15], 9], expected: [0, 1] },
      { name: "middle pair", group: "Sample", reveal: true, args: [[3, 2, 4], 6], expected: [1, 2] },
      { name: "duplicate values", group: "Edge", reveal: true, args: [[3, 3], 6], expected: [0, 1] },
      { name: "negative complement", group: "Hidden", reveal: false, args: [[-4, 8, 11, 2, 7], 4], expected: [0, 1] },
      { name: "late answer", group: "Hidden", reveal: false, args: [[5, 1, 9, 13, 4, 8], 17], expected: [3, 4] },
    ],
  },
  validParentheses: {
    title: "Valid parentheses",
    difficulty: "Easy",
    topic: "Stack",
    entry: "isValid",
    prompt: "Write isValid(s). Return true when brackets close in the correct order.",
    constraints: ["Only bracket characters are included", "Every opening bracket must close in reverse order", "An empty stack at the end means valid"],
    complexity: { time: "O(n)", space: "O(n)" },
    examples: [
      { input: 's = "([{}])"', output: "true", note: "Nested brackets close in reverse order." },
      { input: 's = "(]"', output: "false", note: "The closing bracket does not match the latest opener." },
    ],
    hints: [
      "Push opening brackets onto a stack.",
      "When you see a closing bracket, compare it with the top of the stack.",
      "Return false immediately when the stack is empty or the pair does not match.",
    ],
    template: `function isValid(s) {
  const stack = [];
  const pairs = {
    ")": "(",
    "]": "[",
    "}": "{",
  };

  for (const char of s) {
    // Write your stack logic here
  }

  return stack.length === 0;
}`,
    tests: [
      { name: "separate pairs", group: "Sample", reveal: true, args: ["()[]{}"], expected: true },
      { name: "nested pairs", group: "Sample", reveal: true, args: ["([{}])"], expected: true },
      { name: "wrong closer", group: "Edge", reveal: true, args: ["(]"], expected: false },
      { name: "early close", group: "Hidden", reveal: false, args: [")("], expected: false },
      { name: "unfinished open", group: "Hidden", reveal: false, args: ["((({[]}))"], expected: false },
    ],
  },
  maxSubarray: {
    title: "Maximum subarray",
    difficulty: "Medium",
    topic: "Dynamic Programming",
    entry: "maxSubArray",
    prompt: "Write maxSubArray(nums). Return the largest sum of any contiguous subarray.",
    constraints: ["nums contains at least one number", "The subarray must be contiguous", "Negative-only arrays are valid"],
    complexity: { time: "O(n)", space: "O(1)" },
    examples: [
      { input: "nums = [-2,1,-3,4,-1,2,1,-5,4]", output: "6", note: "[4,-1,2,1] has the largest sum." },
      { input: "nums = [-5,-2,-8]", output: "-2", note: "The best subarray can be one negative number." },
    ],
    hints: [
      "Track the best subarray ending at the current index.",
      "At each number, decide whether to extend the previous streak or start fresh.",
      "Keep a separate global best while scanning once.",
    ],
    template: `function maxSubArray(nums) {
  let current = nums[0];
  let best = nums[0];

  for (let i = 1; i < nums.length; i += 1) {
    // Update current and best here
  }

  return best;
}`,
    tests: [
      { name: "classic kadane", group: "Sample", reveal: true, args: [[-2, 1, -3, 4, -1, 2, 1, -5, 4]], expected: 6 },
      { name: "single item", group: "Edge", reveal: true, args: [[7]], expected: 7 },
      { name: "all negative", group: "Edge", reveal: true, args: [[-5, -2, -8]], expected: -2 },
      { name: "late streak", group: "Hidden", reveal: false, args: [[1, -4, 3, 10, -4, 7, 2, -5]], expected: 18 },
      { name: "zeros included", group: "Hidden", reveal: false, args: [[0, -1, 0, -2, 0]], expected: 0 },
    ],
  },
  mergeIntervals: {
    title: "Merge intervals",
    difficulty: "Medium",
    topic: "Sorting",
    entry: "merge",
    prompt: "Write merge(intervals). Return intervals after merging every overlap.",
    constraints: ["Each interval is [start, end]", "Intervals can arrive unsorted", "Return intervals sorted by start"],
    complexity: { time: "O(n log n)", space: "O(n)" },
    examples: [
      { input: "intervals = [[1,3],[2,6],[8,10]]", output: "[[1,6],[8,10]]", note: "[1,3] overlaps [2,6]." },
      { input: "intervals = [[1,4],[4,5]]", output: "[[1,5]]", note: "Touching boundaries merge." },
    ],
    hints: [
      "Sort intervals by start first.",
      "Keep a result array and compare each interval with the last merged interval.",
      "If the next start is less than or equal to the last end, extend the last end.",
    ],
    template: `function merge(intervals) {
  if (intervals.length <= 1) return intervals;

  intervals.sort((a, b) => a[0] - b[0]);
  const merged = [];

  for (const interval of intervals) {
    // Merge interval into merged here
  }

  return merged;
}`,
    tests: [
      { name: "basic overlap", group: "Sample", reveal: true, args: [[[1, 3], [2, 6], [8, 10], [15, 18]]], expected: [[1, 6], [8, 10], [15, 18]] },
      { name: "touching intervals", group: "Sample", reveal: true, args: [[[1, 4], [4, 5]]], expected: [[1, 5]] },
      { name: "unsorted input", group: "Edge", reveal: true, args: [[[8, 10], [1, 3], [2, 6]]], expected: [[1, 6], [8, 10]] },
      { name: "fully nested", group: "Hidden", reveal: false, args: [[[1, 10], [2, 3], [4, 8], [11, 12]]], expected: [[1, 10], [11, 12]] },
      { name: "single interval", group: "Hidden", reveal: false, args: [[[3, 7]]], expected: [[3, 7]] },
    ],
  },
};
