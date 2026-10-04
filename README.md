# DSA Visuals

An interactive portfolio project for learning core data structures and algorithms. It includes organized visual labs for sorting, search, structures, graphs, pathfinding, and hands-on code practice.

## Features

- Sorting visualizer for bubble, selection, insertion, merge, and quick sort
- Algorithm race mode that compares multiple sorting algorithms on the same input
- Search lab with binary and linear search modes
- Stack and queue playground showing LIFO and FIFO behavior
- Binary search tree insert, delete, and traversal modes
- Graph visualizer for BFS, DFS, and Dijkstra shortest paths
- Pathfinding lab for BFS, DFS, Dijkstra, and A* with editable walls and weighted cells
- Built-in JavaScript practice editor with test cases for DSA challenges
- Live step count, comparisons, writes, pseudocode highlighting, and trace log
- Responsive black/white layout with colorful algorithm states

## Run Locally

```bash
npm install
npm run dev
```

Then open:

```text
http://127.0.0.1:5173
```

Build for deployment:

```bash
npm run build
```

## Deploy to GitHub Pages

This is a Vite React app, so GitHub Pages should deploy the built `dist` folder, not the project root.

Recommended setup:

1. Push this repo to GitHub on the `main` branch.
2. Go to the repo's `Settings` -> `Pages`.
3. Under `Build and deployment`, choose `GitHub Actions`.
4. Push a commit. The workflow in `.github/workflows/deploy.yml` will build the app and publish `dist`.

The Vite config uses `base: "./"` so the generated asset links work on both user pages and project pages.

## Portfolio Notes

Good portfolio talking points:

- Built as a React/Vite application with reusable components, shared data modules, and utility functions.
- Built algorithm animations from explicit state snapshots instead of mutating the DOM directly.
- Designed each visualizer around the operation that matters most: swaps, search windows, LIFO/FIFO flow, traversal order, and graph frontier expansion.
- Added a code-practice workspace with a browser-based JavaScript runner and test-case feedback.
