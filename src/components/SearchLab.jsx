import { useState } from "react";
import LabShell from "./LabShell";
import { ButtonGrid, ControlGroup, RangeControl } from "./FormControls";
import { makeArray, makeSortedUniqueArray, randomInt } from "../utils/array";
import { buildBinarySearchSteps, buildLinearSearchSteps } from "../utils/search";

const speedMap = {
  1: { label: "Slow", delay: 620 },
  2: { label: "Easy", delay: 420 },
  3: { label: "Normal", delay: 260 },
  4: { label: "Fast", delay: 140 },
  5: { label: "Rapid", delay: 70 },
};

function createScenario(tool, size) {
  const values = tool === "binary" ? makeSortedUniqueArray(size) : makeArray(size, 4, 98);
  const target = Math.random() > 0.28 ? values[randomInt(0, values.length - 1)] : randomInt(99, 125);
  const steps = tool === "binary" ? buildBinarySearchSteps(values, target) : buildLinearSearchSteps(values, target);
  return { values, target, steps };
}

function SearchCells({ values, step }) {
  return (
    <div className="search-track">
      {values.map((value, index) => {
        const classes = ["search-cell"];
        if (step?.type === "binary") {
          if (index < step.low || index > step.high) classes.push("discarded");
          if (index === step.low) classes.push("low");
          if (index === step.high) classes.push("high");
          if (index === step.mid) classes.push(step.found ? "found" : "mid");
        } else if (step?.type === "linearSearch") {
          if (index < step.current) classes.push("discarded");
          if (index === step.current) classes.push(step.found ? "found" : "mid");
        }
        return (
          <div className={classes.join(" ")} data-index={index} key={`${value}-${index}`}>
            {value}
          </div>
        );
      })}
    </div>
  );
}

export default function SearchLab() {
  const [tool, setTool] = useState("binary");
  const [size, setSize] = useState(15);
  const [speed, setSpeed] = useState(3);
  const [scenario, setScenario] = useState(() => createScenario("binary", 15));
  const [stepIndex, setStepIndex] = useState(0);
  const [stats, setStats] = useState({ steps: 0, comparisons: 0, writes: 0, status: "Ready" });
  const [trace, setTrace] = useState(["Pick a search type and run it step by step."]);
  const [running, setRunning] = useState(false);

  const currentStep = scenario.steps[Math.max(0, stepIndex - 1)];

  const addTrace = (message) => setTrace((items) => [message, ...items].slice(0, 8));

  const resetWith = (nextTool = tool, nextSize = size) => {
    const nextScenario = createScenario(nextTool, nextSize);
    setScenario(nextScenario);
    setStepIndex(0);
    setStats({ steps: 0, comparisons: 0, writes: 0, status: "Ready" });
    setTrace([`Target is ${nextScenario.target}.`]);
  };

  const applyStep = () => {
    const step = scenario.steps[stepIndex];
    if (!step) {
      setStats((current) => ({ ...current, status: current.status === "Found" ? "Found" : "Not found" }));
      return false;
    }
    const status = step.found ? "Found" : step.notFound ? "Not found" : "Searching";
    setStepIndex((index) => index + 1);
    setStats((current) => ({
      steps: current.steps + 1,
      comparisons: current.comparisons + step.comparisons,
      writes: 0,
      status,
    }));
    addTrace(step.message);
    return !step.found && !step.notFound;
  };

  const runSearch = async () => {
    setRunning(true);
    let nextStats = { ...stats };
    for (let index = stepIndex; index < scenario.steps.length; index += 1) {
      const step = scenario.steps[index];
      const status = step.found ? "Found" : step.notFound ? "Not found" : "Searching";
      nextStats = {
        steps: nextStats.steps + 1,
        comparisons: nextStats.comparisons + step.comparisons,
        writes: 0,
        status,
      };
      setStepIndex(index + 1);
      setStats(nextStats);
      addTrace(step.message);
      if (step.found || step.notFound) break;
      await new Promise((resolve) => setTimeout(resolve, speedMap[speed].delay));
    }
    setRunning(false);
  };

  const controls = (
    <>
      <ControlGroup label="Search type" htmlFor="searchType">
        <select id="searchType" value={tool} onChange={(event) => {
          const nextTool = event.target.value;
          setTool(nextTool);
          resetWith(nextTool, size);
        }}>
          <option value="binary">Binary search</option>
          <option value="linearSearch">Linear search</option>
        </select>
      </ControlGroup>
      <RangeControl label="Items" id="searchSize" min={8} max={24} value={size} valueLabel={size} onChange={(nextSize) => {
        setSize(nextSize);
        resetWith(tool, nextSize);
      }} />
      <RangeControl label="Speed" id="searchSpeed" min={1} max={5} value={speed} valueLabel={speedMap[speed].label} onChange={setSpeed} />
      <ButtonGrid>
        <button className="button primary" type="button" disabled={running} onClick={runSearch}>Run</button>
        <button className="button secondary" type="button" disabled={running} onClick={applyStep}>Step</button>
        <button className="button secondary" type="button" disabled={running} onClick={() => resetWith(tool, size)}>New Data</button>
        <button className="button ghost" type="button" disabled={running} onClick={() => {
          setStepIndex(0);
          setStats({ steps: 0, comparisons: 0, writes: 0, status: "Ready" });
          setTrace([`Target is ${scenario.target}.`]);
        }}>Reset</button>
      </ButtonGrid>
    </>
  );

  return (
    <LabShell
      title="Search Lab"
      description={`Find target ${scenario.target} and compare how the search window changes.`}
      controls={controls}
      complexityKey={tool}
      pseudoKey={tool}
      activeLine={currentStep?.line}
      stats={stats}
      trace={trace}
    >
      <SearchCells values={scenario.values} step={currentStep} />
    </LabShell>
  );
}
