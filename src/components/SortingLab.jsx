import { useState } from "react";
import LabShell from "./LabShell";
import { ButtonGrid, ControlGroup, RangeControl } from "./FormControls";
import { algorithmComplexity, raceSets } from "../data/algorithmData";
import { makeArray } from "../utils/array";
import { buildSortSteps } from "../utils/sorting";

const speedMap = {
  1: { label: "Slow", delay: 620 },
  2: { label: "Easy", delay: 420 },
  3: { label: "Normal", delay: 260 },
  4: { label: "Fast", delay: 140 },
  5: { label: "Rapid", delay: 70 },
};

const initialSortArray = makeArray(18);

function Bars({ values, highlight = {}, classPrefix = "bar" }) {
  const max = Math.max(...values, 1);
  return values.map((value, index) => {
    const classes = [classPrefix];
    if (highlight.active?.includes(index)) classes.push("active");
    if (highlight.compare?.includes(index)) classes.push("compare");
    if (highlight.sorted?.includes(index)) classes.push("sorted");
    return (
      <div
        aria-label={`Value ${value}`}
        className={classes.join(" ")}
        data-value={classPrefix === "bar" ? value : undefined}
        key={`${value}-${index}`}
        style={{ height: `${Math.max(10, (value / max) * 100)}%` }}
      />
    );
  });
}

function createRacers(baseArray, preset) {
  return (raceSets[preset] || raceSets.classic).map((algorithm) => ({
    id: algorithm,
    name: algorithmComplexity[algorithm].name,
    steps: buildSortSteps(baseArray, algorithm),
    index: 0,
    array: [...baseArray],
    highlight: {},
    comparisons: 0,
    writes: 0,
    done: false,
    finishTick: Infinity,
  }));
}

export default function SortingLab() {
  const [tool, setTool] = useState("visualizer");
  const [algorithm, setAlgorithm] = useState("bubble");
  const [size, setSize] = useState(18);
  const [speed, setSpeed] = useState(3);
  const [array, setArray] = useState(() => initialSortArray);
  const [sortSteps, setSortSteps] = useState(() => buildSortSteps(initialSortArray, "bubble"));
  const [sortIndex, setSortIndex] = useState(0);
  const [sortStats, setSortStats] = useState({ steps: 0, comparisons: 0, writes: 0, status: "Ready" });
  const [trace, setTrace] = useState(["Pick an algorithm, then run or step through it."]);
  const [running, setRunning] = useState(false);
  const [racePreset, setRacePreset] = useState("classic");
  const [raceBase, setRaceBase] = useState(() => makeArray(18));
  const [raceTick, setRaceTick] = useState(0);
  const [racers, setRacers] = useState(() => createRacers(raceBase, "classic"));

  const currentSortStep = sortSteps[Math.max(0, sortIndex - 1)];
  const speedDelay = speedMap[speed].delay;

  const addTrace = (message) => setTrace((items) => [message, ...items].slice(0, 8));

  const resetSort = (nextArray = array, nextAlgorithm = algorithm) => {
    setArray(nextArray);
    setSortSteps(buildSortSteps(nextArray, nextAlgorithm));
    setSortIndex(0);
    setSortStats({ steps: 0, comparisons: 0, writes: 0, status: "Ready" });
    setTrace(["Sorting state reset."]);
  };

  const newSortData = (nextSize = size) => {
    const values = makeArray(nextSize);
    resetSort(values, algorithm);
    setRaceBase(values);
    setRacers(createRacers(values, racePreset));
    setRaceTick(0);
  };

  const applySortStep = () => {
    const step = sortSteps[sortIndex];
    if (!step) {
      setSortStats((stats) => ({ ...stats, status: "Sorted" }));
      return false;
    }
    setArray(step.array);
    setSortIndex((index) => index + 1);
    setSortStats((stats) => ({
      steps: stats.steps + 1,
      comparisons: stats.comparisons + step.comparisons,
      writes: stats.writes + step.writes,
      status: sortIndex >= sortSteps.length - 1 ? "Sorted" : "Running",
    }));
    addTrace(step.action);
    return true;
  };

  const runSort = async () => {
    setRunning(true);
    let nextStats = { ...sortStats };
    for (let index = sortIndex; index < sortSteps.length; index += 1) {
      const step = sortSteps[index];
      nextStats = {
        steps: nextStats.steps + 1,
        comparisons: nextStats.comparisons + step.comparisons,
        writes: nextStats.writes + step.writes,
        status: index >= sortSteps.length - 1 ? "Sorted" : "Running",
      };
      setArray(step.array);
      setSortIndex(index + 1);
      setSortStats(nextStats);
      addTrace(step.action);
      if (index < sortSteps.length - 1) await new Promise((resolve) => setTimeout(resolve, speedDelay));
    }
    if (!sortSteps.length) setSortStats((stats) => ({ ...stats, status: "Sorted" }));
    setRunning(false);
  };

  const getNextRaceFrame = (raceList, tick) => {
    const nextTick = tick + 1;
    const finished = [];
    const nextRacers = raceList.map((racer) => {
      if (racer.done) return racer;
      const step = racer.steps[racer.index];
      if (!step) {
        const doneRacer = { ...racer, done: true, finishTick: Math.min(racer.finishTick, nextTick) };
        finished.push(doneRacer);
        return doneRacer;
      }
      const next = {
        ...racer,
        array: step.array,
        highlight: step.highlight,
        index: racer.index + 1,
        comparisons: racer.comparisons + step.comparisons,
        writes: racer.writes + step.writes,
      };
      if (next.index >= next.steps.length) {
        next.done = true;
        next.finishTick = nextTick;
        finished.push(next);
      }
      return next;
    });
    const winner = raceWinner(nextRacers);
    return {
      allDone: nextRacers.every((racer) => racer.done),
      finished,
      nextRacers,
      nextTick,
      winner,
    };
  };

  const resetRace = (base = raceBase, preset = racePreset) => {
    setRaceTick(0);
    setRacers(createRacers(base, preset));
    setSortStats({ steps: 0, comparisons: 0, writes: 0, status: "Ready" });
    setTrace(["Race ready. Every algorithm gets the exact same array."]);
  };

  const newRaceData = (nextSize = size) => {
    const values = makeArray(nextSize);
    setRaceBase(values);
    resetRace(values, racePreset);
  };

  const raceWinner = (raceList = racers) =>
    [...raceList].filter((racer) => racer.done).sort((a, b) => a.finishTick - b.finishTick || a.comparisons + a.writes - (b.comparisons + b.writes))[0];

  const applyRaceStep = () => {
    const { allDone, finished, nextRacers, nextTick, winner } = getNextRaceFrame(racers, raceTick);
    const comparisons = nextRacers.reduce((sum, racer) => sum + racer.comparisons, 0);
    const writes = nextRacers.reduce((sum, racer) => sum + racer.writes, 0);

    setRaceTick(nextTick);
    setRacers(nextRacers);
    setSortStats({
      steps: nextTick,
      comparisons,
      writes,
      status: allDone && winner ? `Winner: ${winner.name}` : "Racing",
    });
    if (nextTick === 1) addTrace("Race started: all algorithms advanced one step.");
    finished.forEach((racer) => addTrace(`${racer.name} finished at race tick ${racer.finishTick}.`));
    if (allDone && winner) addTrace(`${winner.name} wins by finishing first on this input.`);
    return !allDone;
  };

  const runRace = async () => {
    setRunning(true);
    let nextRacers = racers;
    let nextTick = raceTick;
    for (let keepGoing = true; keepGoing;) {
      const frame = getNextRaceFrame(nextRacers, nextTick);
      nextRacers = frame.nextRacers;
      nextTick = frame.nextTick;
      const comparisons = nextRacers.reduce((sum, racer) => sum + racer.comparisons, 0);
      const writes = nextRacers.reduce((sum, racer) => sum + racer.writes, 0);
      setRaceTick(nextTick);
      setRacers(nextRacers);
      setSortStats({
        steps: nextTick,
        comparisons,
        writes,
        status: frame.allDone && frame.winner ? `Winner: ${frame.winner.name}` : "Racing",
      });
      if (nextTick === 1) addTrace("Race started: all algorithms advanced one step.");
      frame.finished.forEach((racer) => addTrace(`${racer.name} finished at race tick ${racer.finishTick}.`));
      if (frame.allDone && frame.winner) addTrace(`${frame.winner.name} wins by finishing first on this input.`);
      keepGoing = !frame.allDone;
      if (keepGoing) await new Promise((resolve) => setTimeout(resolve, Math.max(45, speedDelay * 0.55)));
    }
    setRunning(false);
  };

  const controls = (
    <>
      <ControlGroup label="Sorting tool" htmlFor="sortTool">
        <select id="sortTool" value={tool} onChange={(event) => setTool(event.target.value)}>
          <option value="visualizer">Visualizer</option>
          <option value="race">Algorithm race</option>
        </select>
      </ControlGroup>
      {tool === "visualizer" ? (
        <ControlGroup label="Algorithm" htmlFor="sortAlgorithm">
          <select id="sortAlgorithm" value={algorithm} onChange={(event) => {
            const nextAlgorithm = event.target.value;
            setAlgorithm(nextAlgorithm);
            resetSort(array, nextAlgorithm);
          }}>
            <option value="bubble">Bubble sort</option>
            <option value="selection">Selection sort</option>
            <option value="insertion">Insertion sort</option>
            <option value="merge">Merge sort</option>
            <option value="quick">Quick sort</option>
          </select>
        </ControlGroup>
      ) : (
        <ControlGroup label="Matchup" htmlFor="racePreset">
          <select id="racePreset" value={racePreset} onChange={(event) => {
            setRacePreset(event.target.value);
            resetRace(raceBase, event.target.value);
          }}>
            <option value="classic">Classic: bubble, insertion, merge, quick</option>
            <option value="fundamentals">Fundamentals: bubble, selection, insertion</option>
            <option value="fast">Fast set: insertion, merge, quick</option>
          </select>
        </ControlGroup>
      )}
      <RangeControl label="Items" id="sortSize" min={8} max={36} value={size} valueLabel={size} onChange={(nextSize) => {
        setSize(nextSize);
        newSortData(nextSize);
      }} />
      <RangeControl label="Speed" id="sortSpeed" min={1} max={5} value={speed} valueLabel={speedMap[speed].label} onChange={setSpeed} />
      {tool === "visualizer" ? (
        <ButtonGrid>
          <button className="button primary" type="button" disabled={running} onClick={runSort}>Run</button>
          <button className="button secondary" type="button" disabled={running} onClick={applySortStep}>Step</button>
          <button className="button secondary" type="button" disabled={running} onClick={() => newSortData(size)}>Shuffle</button>
          <button className="button ghost" type="button" disabled={running} onClick={() => resetSort(array)}>Reset</button>
        </ButtonGrid>
      ) : (
        <ButtonGrid>
          <button className="button primary" type="button" disabled={running} onClick={runRace}>Run Race</button>
          <button className="button secondary" type="button" disabled={running} onClick={applyRaceStep}>Step</button>
          <button className="button secondary" type="button" disabled={running} onClick={() => newRaceData(size)}>New Data</button>
          <button className="button ghost" type="button" disabled={running} onClick={() => resetRace()}>Reset</button>
        </ButtonGrid>
      )}
    </>
  );

  const totalComparisons = racers.reduce((sum, racer) => sum + racer.comparisons, 0);
  const totalWrites = racers.reduce((sum, racer) => sum + racer.writes, 0);
  const winner = raceWinner();
  const bestWork = racers.length ? [...racers].sort((a, b) => a.comparisons + a.writes - (b.comparisons + b.writes))[0] : null;

  return (
    <LabShell
      title={tool === "visualizer" ? "Sorting Visualizer" : "Algorithm Race"}
      description={tool === "visualizer" ? "Compare swaps and comparisons while bars move through each sorting pass." : "Run multiple sorting algorithms on the same input and compare work, speed, and finish order."}
      controls={controls}
      complexityKey={tool === "visualizer" ? algorithm : "race"}
      pseudoKey={tool === "visualizer" ? algorithm : "race"}
      activeLine={tool === "visualizer" ? currentSortStep?.line : racers.every((racer) => racer.done) ? 3 : 1}
      stats={sortStats}
      trace={trace}
    >
      {tool === "visualizer" ? (
        <div className="bar-chart">
          <Bars values={array} highlight={currentSortStep?.highlight || {}} />
        </div>
      ) : (
        <>
          <div className="race-summary">
            <article className="race-summary-card"><span>Leader</span><strong>{winner ? winner.name : "Race not finished"}</strong></article>
            <article className="race-summary-card"><span>Total Work</span><strong>{totalComparisons} comparisons / {totalWrites} writes</strong></article>
            <article className="race-summary-card"><span>Fewest Ops</span><strong>{bestWork ? `${bestWork.name} (${bestWork.comparisons + bestWork.writes})` : "None"}</strong></article>
          </div>
          <div className="race-grid">
            {racers.map((racer) => {
              const progress = racer.steps.length ? Math.round((racer.index / racer.steps.length) * 100) : 100;
              const isWinner = winner?.id === racer.id;
              return (
                <article className={`race-card ${racer.done ? "done" : ""} ${isWinner ? "winner" : ""}`} key={racer.id}>
                  <div className="race-card-head">
                    <h2>{racer.name}</h2>
                    <span className="race-status">{isWinner ? "Winner" : racer.done ? "Done" : racer.index ? "Racing" : "Ready"}</span>
                  </div>
                  <div className="race-bars"><Bars values={racer.array} highlight={racer.highlight} classPrefix="race-bar" /></div>
                  <div className="race-metrics">
                    <div className="race-metric"><span>Steps</span><strong>{racer.index}</strong></div>
                    <div className="race-metric"><span>Compare</span><strong>{racer.comparisons}</strong></div>
                    <div className="race-metric"><span>Writes</span><strong>{racer.writes}</strong></div>
                    <div className="race-metric"><span>Done</span><strong>{progress}%</strong></div>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}
    </LabShell>
  );
}
