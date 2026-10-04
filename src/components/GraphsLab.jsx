import { useMemo, useState } from "react";
import LabShell from "./LabShell";
import { ButtonGrid, ControlGroup } from "./FormControls";

const graphNodes = [
  { id: "A", x: 92, y: 196 },
  { id: "B", x: 244, y: 84 },
  { id: "C", x: 252, y: 300 },
  { id: "D", x: 430, y: 118 },
  { id: "E", x: 454, y: 284 },
  { id: "F", x: 642, y: 196 },
];

const graphEdges = [
  ["A", "B", 4],
  ["A", "C", 2],
  ["B", "D", 5],
  ["B", "E", 10],
  ["C", "E", 3],
  ["D", "F", 4],
  ["E", "D", 1],
  ["E", "F", 7],
];

const COLS = 18;
const ROWS = 10;
const startCell = 19;
const endCell = 160;
const defaultWalls = new Set([25, 26, 27, 44, 62, 80, 98, 116, 63, 64, 65, 66, 104, 122, 140, 141, 142]);
const defaultWeights = new Set([39, 40, 57, 75, 93, 111, 129]);

function adjacency() {
  const map = new Map(graphNodes.map((node) => [node.id, []]));
  graphEdges.forEach(([from, to, weight]) => {
    map.get(from).push({ to, weight });
    map.get(to).push({ to: from, weight });
  });
  return map;
}

function buildGraphSteps(algorithm, start) {
  const adj = adjacency();
  const visited = new Set();
  const queued = new Set([start]);
  const parent = new Map();
  const steps = [{ current: start, visited: [], queued: [start], activeEdge: null, path: [], message: `Start at node ${start}.`, line: 0 }];

  if (algorithm === "dijkstra") {
    const dist = new Map(graphNodes.map((node) => [node.id, Infinity]));
    dist.set(start, 0);
    const frontier = [{ id: start, cost: 0 }];
    while (frontier.length) {
      frontier.sort((a, b) => a.cost - b.cost);
      const current = frontier.shift();
      if (visited.has(current.id)) continue;
      visited.add(current.id);
      steps.push({ current: current.id, visited: [...visited], queued: frontier.map((item) => item.id), activeEdge: null, path: [], message: `Visit ${current.id} with shortest known cost ${current.cost}.`, line: 1 });
      adj.get(current.id).forEach((edge) => {
        if (visited.has(edge.to)) return;
        const nextCost = current.cost + edge.weight;
        if (nextCost < dist.get(edge.to)) {
          dist.set(edge.to, nextCost);
          parent.set(edge.to, current.id);
          frontier.push({ id: edge.to, cost: nextCost });
          steps.push({ current: current.id, visited: [...visited], queued: frontier.map((item) => item.id), activeEdge: `${current.id}-${edge.to}`, path: [], message: `Relax edge ${current.id} -> ${edge.to}; new cost ${nextCost}.`, line: 2 });
        }
      });
    }
  } else {
    const frontier = [start];
    while (frontier.length) {
      const current = algorithm === "dfs" ? frontier.pop() : frontier.shift();
      if (visited.has(current)) continue;
      visited.add(current);
      queued.delete(current);
      steps.push({ current, visited: [...visited], queued: [...queued], activeEdge: null, path: [], message: `Visit node ${current}.`, line: 1 });
      adj.get(current).forEach((edge) => {
        if (!visited.has(edge.to) && !queued.has(edge.to)) {
          parent.set(edge.to, current);
          frontier.push(edge.to);
          queued.add(edge.to);
          steps.push({ current, visited: [...visited], queued: [...queued], activeEdge: `${current}-${edge.to}`, path: [], message: `Queue neighbor ${edge.to} from ${current}.`, line: 2 });
        }
      });
    }
  }

  const path = [];
  let cursor = "F";
  while (cursor && cursor !== start) {
    path.unshift(cursor);
    cursor = parent.get(cursor);
  }
  if (cursor === start) path.unshift(start);
  steps.push({ current: null, visited: [...visited], queued: [], activeEdge: null, path, message: path.length ? `Reconstructed path to F: ${path.join(" -> ")}.` : "Traversal complete.", line: 3 });
  return steps;
}

function neighbors(cell) {
  const row = Math.floor(cell / COLS);
  const col = cell % COLS;
  return [
    row > 0 ? cell - COLS : null,
    col < COLS - 1 ? cell + 1 : null,
    row < ROWS - 1 ? cell + COLS : null,
    col > 0 ? cell - 1 : null,
  ].filter((item) => item !== null);
}

function heuristic(cell) {
  const row = Math.floor(cell / COLS);
  const col = cell % COLS;
  const endRow = Math.floor(endCell / COLS);
  const endCol = endCell % COLS;
  return Math.abs(row - endRow) + Math.abs(col - endCol);
}

function buildPathSteps(algorithm, walls, weights) {
  const wallSet = new Set(walls);
  const weightSet = new Set(weights);
  const visited = new Set();
  const parent = new Map();
  const cost = new Map([[startCell, 0]]);
  const frontier = [{ cell: startCell, priority: 0 }];
  const steps = [{ current: startCell, visited: [], frontier: [startCell], path: [], message: "Start from the blue cell.", line: 0 }];

  while (frontier.length) {
    frontier.sort((a, b) => algorithm === "dfs" ? b.priority - a.priority : a.priority - b.priority);
    const current = frontier.shift().cell;
    if (visited.has(current)) continue;
    visited.add(current);
    steps.push({ current, visited: [...visited], frontier: frontier.map((item) => item.cell), path: [], message: `Explore cell ${current}.`, line: 1 });
    if (current === endCell) break;

    neighbors(current).forEach((next) => {
      if (wallSet.has(next) || visited.has(next)) return;
      const stepCost = weightSet.has(next) ? 5 : 1;
      const nextCost = (cost.get(current) || 0) + stepCost;
      if (!cost.has(next) || nextCost < cost.get(next)) {
        cost.set(next, nextCost);
        parent.set(next, current);
        const priority = algorithm === "astar" ? nextCost + heuristic(next) : algorithm === "dijkstra" ? nextCost : steps.length;
        frontier.push({ cell: next, priority });
      }
    });
  }

  const path = [];
  let cursor = endCell;
  while (cursor !== undefined) {
    path.unshift(cursor);
    if (cursor === startCell) break;
    cursor = parent.get(cursor);
  }
  steps.push({ current: null, visited: [...visited], frontier: [], path: path[0] === startCell ? path : [], message: path[0] === startCell ? `Path found with ${path.length} cells.` : "No path found.", line: 3 });
  return steps;
}

function edgeKey(from, to) {
  return [from, to].sort().join("-");
}

function GraphVisual({ step }) {
  const nodeById = new Map(graphNodes.map((node) => [node.id, node]));
  const pathEdges = new Set((step?.path || []).slice(1).map((node, index) => edgeKey(step.path[index], node)));
  return (
    <svg className="graph-svg" viewBox="0 0 735 380" role="img" aria-label="Weighted graph">
      {graphEdges.map(([from, to, weight]) => {
        const a = nodeById.get(from);
        const b = nodeById.get(to);
        const key = edgeKey(from, to);
        const activeKey = step?.activeEdge ? edgeKey(...step.activeEdge.split("-")) : "";
        return (
          <g key={`${from}-${to}`}>
            <line className={`graph-edge ${activeKey === key ? "active" : ""} ${pathEdges.has(key) ? "path" : ""}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
            <text className="edge-label" x={(a.x + b.x) / 2} y={(a.y + b.y) / 2 - 8}>{weight}</text>
          </g>
        );
      })}
      {graphNodes.map((node) => {
        const classes = ["graph-node"];
        if (step?.current === node.id) classes.push("active");
        if (step?.visited?.includes(node.id)) classes.push("visited");
        if (step?.queued?.includes(node.id)) classes.push("queued");
        return (
          <g className={classes.join(" ")} key={node.id} transform={`translate(${node.x} ${node.y})`}>
            <circle r="27" />
            <text>{node.id}</text>
          </g>
        );
      })}
    </svg>
  );
}

function PathGrid({ step, walls, weights }) {
  return (
    <>
      <div className="path-legend">
        <span><i className="legend-start" /> Start</span>
        <span><i className="legend-end" /> End</span>
        <span><i className="legend-wall" /> Wall</span>
        <span><i className="legend-weight" /> Weight</span>
        <span><i className="legend-path" /> Path</span>
      </div>
      <div className="path-grid" aria-label="Pathfinding grid">
        {Array.from({ length: ROWS * COLS }, (_, cell) => {
          const classes = ["path-cell"];
          if (walls.has(cell)) classes.push("wall");
          if (weights.has(cell)) classes.push("weight");
          if (step?.visited?.includes(cell)) classes.push("visited");
          if (step?.frontier?.includes(cell)) classes.push("frontier");
          if (step?.path?.includes(cell)) classes.push("path");
          if (cell === startCell) classes.push("start");
          if (cell === endCell) classes.push("end");
          return <div className={classes.join(" ")} key={cell} />;
        })}
      </div>
    </>
  );
}

export default function GraphsLab() {
  const [tool, setTool] = useState("graph");
  const [algorithm, setAlgorithm] = useState("bfs");
  const [startNode, setStartNode] = useState("A");
  const [walls, setWalls] = useState(defaultWalls);
  const [weights, setWeights] = useState(defaultWeights);
  const [stepIndex, setStepIndex] = useState(0);
  const [stats, setStats] = useState({ steps: 0, comparisons: 0, writes: 0, status: "Ready" });
  const [trace, setTrace] = useState(["Choose traversal or pathfinding, then run it."]);
  const [running, setRunning] = useState(false);

  const steps = useMemo(() => (
    tool === "graph" ? buildGraphSteps(algorithm, startNode) : buildPathSteps(algorithm, walls, weights)
  ), [algorithm, startNode, tool, walls, weights]);

  const currentStep = steps[Math.max(0, stepIndex - 1)];
  const complexityKey = algorithm === "dijkstra" ? "dijkstra" : tool === "path" ? algorithm === "astar" ? "astar" : "path" : "graph";

  const addTrace = (message) => setTrace((items) => [message, ...items].slice(0, 8));
  const resetRun = (message = "Run reset.") => {
    setStepIndex(0);
    setStats({ steps: 0, comparisons: 0, writes: 0, status: "Ready" });
    setTrace([message]);
  };

  const applyStep = () => {
    const step = steps[stepIndex];
    if (!step) {
      setStats((current) => ({ ...current, status: "Complete" }));
      return false;
    }
    setStepIndex((index) => index + 1);
    setStats((current) => ({
      steps: current.steps + 1,
      comparisons: current.comparisons + 1,
      writes: current.writes,
      status: step.path?.length ? "Path found" : step.message.includes("No path") ? "No path" : "Exploring",
    }));
    addTrace(step.message);
    return stepIndex < steps.length - 1;
  };

  const runGraph = async () => {
    setRunning(true);
    let nextStats = { ...stats };
    for (let index = stepIndex; index < steps.length; index += 1) {
      const step = steps[index];
      nextStats = {
        steps: nextStats.steps + 1,
        comparisons: nextStats.comparisons + 1,
        writes: nextStats.writes,
        status: step.path?.length ? "Path found" : step.message.includes("No path") ? "No path" : "Exploring",
      };
      setStepIndex(index + 1);
      setStats(nextStats);
      addTrace(step.message);
      await new Promise((resolve) => setTimeout(resolve, 170));
    }
    setRunning(false);
  };

  const controls = (
    <>
      <ControlGroup label="Graph tool" htmlFor="graphTool">
        <select id="graphTool" value={tool} onChange={(event) => {
          const nextTool = event.target.value;
          setTool(nextTool);
          if (nextTool === "graph" && algorithm === "astar") setAlgorithm("bfs");
          resetRun(nextTool === "graph" ? "Weighted graph selected." : "Pathfinding grid selected.");
        }}>
          <option value="graph">Graph traversal</option>
          <option value="path">Pathfinding grid</option>
        </select>
      </ControlGroup>
      <ControlGroup label="Algorithm" htmlFor="graphAlgorithm">
        <select id="graphAlgorithm" value={algorithm} onChange={(event) => {
          setAlgorithm(event.target.value);
          resetRun(`${event.target.value.toUpperCase()} selected.`);
        }}>
          <option value="bfs">BFS</option>
          <option value="dfs">DFS</option>
          <option value="dijkstra">Dijkstra</option>
          {tool === "path" && <option value="astar">A*</option>}
        </select>
      </ControlGroup>
      {tool === "graph" && (
        <ControlGroup label="Start node" htmlFor="startNode">
          <select id="startNode" value={startNode} onChange={(event) => {
            setStartNode(event.target.value);
            resetRun(`Start node changed to ${event.target.value}.`);
          }}>
            {graphNodes.map((node) => <option key={node.id} value={node.id}>{node.id}</option>)}
          </select>
        </ControlGroup>
      )}
      <ButtonGrid>
        <button className="button primary" type="button" disabled={running} onClick={runGraph}>Run</button>
        <button className="button secondary" type="button" disabled={running} onClick={applyStep}>Step</button>
        <button className="button secondary" type="button" disabled={running} onClick={() => resetRun()}>Reset</button>
        <button className="button ghost" type="button" disabled={running || tool !== "path"} onClick={() => {
          setWalls(new Set(defaultWalls));
          setWeights(new Set(defaultWeights));
          resetRun("Restored sample walls and weighted cells.");
        }}>Sample</button>
      </ButtonGrid>
    </>
  );

  return (
    <LabShell
      title={tool === "graph" ? "Graph Traversal" : "Pathfinding Lab"}
      description={tool === "graph" ? "Step through BFS, DFS, or Dijkstra on a weighted graph." : "Compare grid search strategies across walls and weighted cells."}
      controls={controls}
      complexityKey={complexityKey}
      pseudoKey={tool}
      activeLine={currentStep?.line}
      stats={stats}
      trace={trace}
    >
      {tool === "graph" ? (
        <GraphVisual step={currentStep} />
      ) : (
        <PathGrid step={currentStep} walls={walls} weights={weights} />
      )}
    </LabShell>
  );
}
