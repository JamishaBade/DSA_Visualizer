import { useMemo, useState } from "react";
import LabShell from "./LabShell";
import { ButtonGrid, ControlGroup } from "./FormControls";
import { randomInt } from "../utils/array";

const baseTreeValues = [50, 25, 75, 12, 37, 62, 87, 31, 43, 58, 71];

function insertTreeNode(root, value) {
  if (!root) return { value, left: null, right: null };
  if (value < root.value) return { ...root, left: insertTreeNode(root.left, value) };
  if (value > root.value) return { ...root, right: insertTreeNode(root.right, value) };
  return root;
}

function buildTree(values) {
  return values.reduce((root, value) => insertTreeNode(root, value), null);
}

function layoutTree(root) {
  const nodes = [];
  const links = [];
  const walk = (node, depth, minX, maxX, parent = null) => {
    if (!node) return;
    const x = (minX + maxX) / 2;
    const y = 42 + depth * 78;
    nodes.push({ value: node.value, x, y });
    if (parent) links.push({ from: parent, to: { value: node.value, x, y } });
    walk(node.left, depth + 1, minX, x, { value: node.value, x, y });
    walk(node.right, depth + 1, x, maxX, { value: node.value, x, y });
  };
  walk(root, 0, 20, 900);
  return { nodes, links };
}

function traverse(root, order) {
  const result = [];
  const walk = (node) => {
    if (!node) return;
    if (order === "preorder") result.push(node.value);
    walk(node.left);
    if (order === "inorder") result.push(node.value);
    walk(node.right);
    if (order === "postorder") result.push(node.value);
  };
  walk(root);
  return result;
}

function ItemCard({ value, marker }) {
  return <div className={`item-card ${marker ? "marker" : ""}`}>{value}</div>;
}

export default function StructuresLab() {
  const [tool, setTool] = useState("stackQueue");
  const [stack, setStack] = useState([12, 28, 44]);
  const [queue, setQueue] = useState([16, 32, 48, 64]);
  const [treeValues, setTreeValues] = useState(baseTreeValues);
  const [inputValue, setInputValue] = useState(39);
  const [order, setOrder] = useState("inorder");
  const [activeTreeValue, setActiveTreeValue] = useState(null);
  const [stats, setStats] = useState({ steps: 0, comparisons: 0, writes: 0, status: "Ready" });
  const [trace, setTrace] = useState(["Use stack, queue, or tree operations and watch the shape change."]);

  const root = useMemo(() => buildTree(treeValues), [treeValues]);
  const treeLayout = useMemo(() => layoutTree(root), [root]);
  const traversal = useMemo(() => traverse(root, order), [root, order]);

  const addTrace = (message) => setTrace((items) => [message, ...items].slice(0, 8));
  const record = (message, writes = 1, comparisons = 0, status = "Updated") => {
    setStats((current) => ({
      steps: current.steps + 1,
      comparisons: current.comparisons + comparisons,
      writes: current.writes + writes,
      status,
    }));
    addTrace(message);
  };

  const pushStack = () => {
    const value = randomInt(10, 99);
    setStack((items) => [...items, value]);
    record(`Pushed ${value} onto the stack.`);
  };

  const popStack = () => {
    setStack((items) => {
      if (!items.length) return items;
      const value = items.at(-1);
      record(`Popped ${value} from the stack.`);
      return items.slice(0, -1);
    });
  };

  const enqueue = () => {
    const value = randomInt(10, 99);
    setQueue((items) => [...items, value]);
    record(`Enqueued ${value} at the back of the queue.`);
  };

  const dequeue = () => {
    setQueue((items) => {
      if (!items.length) return items;
      const [value, ...rest] = items;
      record(`Dequeued ${value} from the front of the queue.`);
      return rest;
    });
  };

  const insertValue = () => {
    if (!Number.isFinite(inputValue)) return;
    if (treeValues.includes(inputValue)) {
      record(`${inputValue} is already in the tree.`, 0, 1, "Duplicate");
      setActiveTreeValue(inputValue);
      return;
    }
    setTreeValues((values) => [...values, inputValue]);
    setActiveTreeValue(inputValue);
    record(`Inserted ${inputValue} into the binary search tree.`, 1, Math.ceil(Math.log2(treeValues.length + 1)), "Inserted");
  };

  const removeValue = () => {
    if (!treeValues.includes(inputValue)) {
      record(`${inputValue} is not in the tree.`, 0, 1, "Missing");
      return;
    }
    setTreeValues((values) => values.filter((value) => value !== inputValue));
    setActiveTreeValue(null);
    record(`Removed ${inputValue} and rebuilt the tree from remaining values.`, 1, 1, "Removed");
  };

  const controls = (
    <>
      <ControlGroup label="Structure" htmlFor="structureTool">
        <select id="structureTool" value={tool} onChange={(event) => {
          setTool(event.target.value);
          setStats({ steps: 0, comparisons: 0, writes: 0, status: "Ready" });
          setTrace([event.target.value === "tree" ? "Tree mode selected." : "Stack and queue mode selected."]);
        }}>
          <option value="stackQueue">Stack and queue</option>
          <option value="tree">Binary search tree</option>
        </select>
      </ControlGroup>
      {tool === "tree" ? (
        <>
          <ControlGroup label="Value" htmlFor="treeValue">
            <input id="treeValue" type="number" min={1} max={99} value={inputValue} onChange={(event) => setInputValue(Number(event.target.value))} />
          </ControlGroup>
          <ControlGroup label="Traversal" htmlFor="treeOrder">
            <select id="treeOrder" value={order} onChange={(event) => {
              setOrder(event.target.value);
              record(`Changed traversal to ${event.target.value}.`, 0, 0, "Traversing");
            }}>
              <option value="inorder">Inorder</option>
              <option value="preorder">Preorder</option>
              <option value="postorder">Postorder</option>
            </select>
          </ControlGroup>
          <ButtonGrid>
            <button className="button primary" type="button" onClick={insertValue}>Insert</button>
            <button className="button secondary" type="button" onClick={removeValue}>Delete</button>
            <button className="button secondary" type="button" onClick={() => {
              setTreeValues(baseTreeValues);
              setActiveTreeValue(null);
              record("Reset the tree to the sample dataset.", 0, 0, "Reset");
            }}>Reset</button>
            <button className="button ghost" type="button" onClick={() => setInputValue(randomInt(5, 95))}>Random</button>
          </ButtonGrid>
        </>
      ) : (
        <ButtonGrid>
          <button className="button primary" type="button" onClick={pushStack}>Push</button>
          <button className="button secondary" type="button" onClick={popStack}>Pop</button>
          <button className="button primary" type="button" onClick={enqueue}>Enqueue</button>
          <button className="button secondary" type="button" onClick={dequeue}>Dequeue</button>
        </ButtonGrid>
      )}
    </>
  );

  return (
    <LabShell
      title={tool === "tree" ? "Binary Search Tree" : "Stack & Queue"}
      description={tool === "tree" ? "Insert, delete, and traverse values while the tree layout updates." : "Push, pop, enqueue, and dequeue to compare LIFO and FIFO behavior."}
      controls={controls}
      complexityKey={tool === "tree" ? "tree" : "structures"}
      pseudoKey={tool === "tree" ? "tree" : "structures"}
      activeLine={tool === "tree" ? 1 : 0}
      stats={stats}
      trace={trace}
    >
      {tool === "tree" ? (
        <>
          <svg className="tree-svg" viewBox="0 0 920 380" role="img" aria-label="Binary search tree">
            {treeLayout.links.map((link) => (
              <line className="tree-link" key={`${link.from.value}-${link.to.value}`} x1={link.from.x} y1={link.from.y + 19} x2={link.to.x} y2={link.to.y - 19} />
            ))}
            {treeLayout.nodes.map((node) => (
              <g className={`tree-node ${node.value === activeTreeValue ? "active" : ""}`} key={node.value} transform={`translate(${node.x} ${node.y})`}>
                <circle r="23" />
                <text>{node.value}</text>
              </g>
            ))}
          </svg>
          <div className="traversal-strip" aria-label={`${order} traversal`}>
            {traversal.map((value) => (
              <span className={`traversal-pill ${value === activeTreeValue ? "active" : ""}`} key={value}>{value}</span>
            ))}
          </div>
        </>
      ) : (
        <div className="structures-layout">
          <section className="structure-zone">
            <div className="zone-heading"><h2>Stack</h2><span>LIFO</span></div>
            <div className="stack-visual">
              {stack.map((value, index) => <ItemCard key={`${value}-${index}`} value={value} marker={index === stack.length - 1} />)}
            </div>
          </section>
          <section className="structure-zone">
            <div className="zone-heading"><h2>Queue</h2><span>FIFO</span></div>
            <div className="queue-visual">
              {queue.map((value, index) => <ItemCard key={`${value}-${index}`} value={value} marker={index === 0} />)}
            </div>
          </section>
        </div>
      )}
    </LabShell>
  );
}
