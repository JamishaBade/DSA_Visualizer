import { useMemo, useState } from "react";
import { practiceChallenges } from "../data/algorithmData";
import { formatJson, parseJsonField, runPracticeCode } from "../utils/practiceRunner";

const testGroups = ["Sample", "Edge", "Hidden", "Custom"];

function defaultCustomTest(challenge) {
  const firstTest = challenge.tests[0];
  return {
    args: formatJson(firstTest.args),
    expected: formatJson(firstTest.expected),
  };
}

function ProblemCard({ id, challenge, active, solved, onSelect }) {
  return (
    <button className={`problem-card ${active ? "active" : ""} ${solved ? "solved" : ""}`} type="button" onClick={() => onSelect(id)}>
      <span className="difficulty-pill">{challenge.difficulty}</span>
      <strong>{challenge.title}</strong>
      <span>{challenge.topic}</span>
    </button>
  );
}

function ExampleList({ examples }) {
  return (
    <div className="practice-info-list">
      {examples.map((example) => (
        <article className="practice-example" key={example.input}>
          <code>{example.input}</code>
          <code>output: {example.output}</code>
          <span>{example.note}</span>
        </article>
      ))}
    </div>
  );
}

function TestCase({ result, fallback, index }) {
  const pass = result?.pass;
  const wasRun = Boolean(result);
  const reveal = fallback.reveal !== false || wasRun;
  const args = result?.args || fallback.args;
  const expected = result?.expected ?? fallback.expected;
  const actual = result?.actual;
  const label = fallback.custom ? "Custom case" : `${fallback.group} ${index + 1}`;

  return (
    <article className={`test-case advanced ${wasRun ? pass ? "pass" : "fail" : ""}`}>
      <div className="test-case-head">
        <strong>{wasRun ? pass ? "Passed" : "Failed" : label}</strong>
        <span>{fallback.name}</span>
      </div>
      {reveal ? (
        <>
          <code>input: {formatJson(args)}</code>
          <code>expected: {formatJson(expected)}</code>
          {wasRun && <code>actual: {formatJson(actual)}</code>}
          {wasRun && <code>runtime: {result.elapsed.toFixed(2)} ms</code>}
        </>
      ) : (
        <code>hidden until run</code>
      )}
    </article>
  );
}

function LineNumbers({ code }) {
  const count = Math.max(1, code.split("\n").length);
  return (
    <div className="editor-gutter" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => <span key={index}>{index + 1}</span>)}
    </div>
  );
}

export default function PracticeLab() {
  const challengeEntries = useMemo(() => Object.entries(practiceChallenges), []);
  const [challengeId, setChallengeId] = useState("binarySearch");
  const [code, setCode] = useState(() => practiceChallenges.binarySearch.template);
  const [results, setResults] = useState([]);
  const [logs, setLogs] = useState([]);
  const [totalMs, setTotalMs] = useState(0);
  const [feedback, setFeedback] = useState({ type: "", message: "Run your code to see test feedback." });
  const [running, setRunning] = useState(false);
  const [hintCount, setHintCount] = useState(0);
  const [solvedByChallenge, setSolvedByChallenge] = useState({});
  const [customArgs, setCustomArgs] = useState(() => defaultCustomTest(practiceChallenges.binarySearch).args);
  const [customExpected, setCustomExpected] = useState(() => defaultCustomTest(practiceChallenges.binarySearch).expected);

  const challenge = practiceChallenges[challengeId];
  const customTestEnabled = customArgs.trim() !== "" || customExpected.trim() !== "";
  const passedCount = results.filter((result) => result.pass).length;
  const hiddenPassed = results.filter((result) => result.group === "Hidden" && result.pass).length;
  const hiddenTotal = challenge.tests.filter((test) => test.group === "Hidden").length;
  const allPassed = results.length > 0 && results.every((result) => result.pass);
  const anyFailed = results.some((result) => !result.pass);
  const visibleHintCount = Math.min(hintCount, challenge.hints.length);
  const lineCount = code.split("\n").length;

  const buildTests = () => {
    const tests = [...challenge.tests];
    if (customTestEnabled) {
      tests.push({
        name: "custom input",
        group: "Custom",
        reveal: true,
        custom: true,
        args: parseJsonField(customArgs, "Custom args"),
        expected: parseJsonField(customExpected, "Custom expected"),
      });
    }
    return tests;
  };

  const runCode = async () => {
    setRunning(true);
    setLogs([]);
    setTotalMs(0);
    setFeedback({ type: "", message: "Running tests..." });

    let tests;
    try {
      tests = buildTests();
    } catch (error) {
      setResults([]);
      setFeedback({ type: "error", message: error.message });
      setRunning(false);
      return;
    }

    const output = await runPracticeCode({ code, entry: challenge.entry, tests });
    if (output.type === "error") {
      setResults([]);
      setLogs(output.logs || []);
      setFeedback({ type: "error", message: output.message });
    } else {
      setResults(output.results);
      setLogs(output.logs || []);
      setTotalMs(output.totalMs || 0);
      const passed = output.results.filter((result) => result.pass).length;
      if (passed === output.results.length) {
        setSolvedByChallenge((items) => ({ ...items, [challengeId]: true }));
        setFeedback({ type: "pass", message: "All tests passed, including edge and hidden cases." });
      } else {
        setFeedback({ type: "fail", message: "The code runs, but at least one output is logically wrong. Compare the failed actual value with the expected value." });
      }
    }
    setRunning(false);
  };

  const changeChallenge = (nextId) => {
    const nextChallenge = practiceChallenges[nextId];
    const nextCustom = defaultCustomTest(nextChallenge);
    setChallengeId(nextId);
    setCode(nextChallenge.template);
    setResults([]);
    setLogs([]);
    setTotalMs(0);
    setHintCount(0);
    setCustomArgs(nextCustom.args);
    setCustomExpected(nextCustom.expected);
    setFeedback({ type: "", message: "Run your code to see test feedback." });
  };

  const resetCode = () => {
    setCode(challenge.template);
    setResults([]);
    setLogs([]);
    setTotalMs(0);
    setFeedback({ type: "", message: "Template restored." });
  };

  const testsForDisplay = customTestEnabled
    ? [...challenge.tests, { name: "custom input", group: "Custom", reveal: true, custom: true, args: [], expected: null }]
    : challenge.tests;

  return (
    <main className="workspace practice-workspace advanced-practice">
      <aside className="practice-problem-rail">
        <div className="panel-heading compact">
          <p className="eyebrow">Practice</p>
          <h1>Problems</h1>
        </div>
        <div className="problem-card-list">
          {challengeEntries.map(([id, item]) => (
            <ProblemCard
              active={challengeId === id}
              challenge={item}
              id={id}
              key={id}
              onSelect={changeChallenge}
              solved={solvedByChallenge[id]}
            />
          ))}
        </div>
      </aside>

      <section className="practice-main">
        <section className="practice-toolbar advanced">
          <div className="practice-toolbar-copy">
            <div className="practice-meta-row">
              <span className="difficulty-pill">{challenge.difficulty}</span>
              <span>{challenge.topic}</span>
              <span>{challenge.complexity.time} time</span>
              <span>{challenge.complexity.space} space</span>
            </div>
            <h1>{challenge.title}</h1>
            <p className="practice-prompt">{challenge.prompt}</p>
          </div>
          <div className="practice-toolbar-controls">
            <label className="field-label" htmlFor="practiceChallenge">Challenge</label>
            <select id="practiceChallenge" value={challengeId} onChange={(event) => changeChallenge(event.target.value)}>
              {challengeEntries.map(([id, item]) => <option key={id} value={id}>{item.title}</option>)}
            </select>
            <button className="button primary" type="button" disabled={running} onClick={runCode}>Run Tests</button>
            <button className="button ghost" type="button" disabled={running} onClick={resetCode}>Reset</button>
          </div>
        </section>

        <section className="practice-studio">
          <article className="practice-editor-panel problem-brief-panel">
            <div className="panel-heading compact">
              <p className="eyebrow">Brief</p>
              <h2>Examples</h2>
            </div>
            <ExampleList examples={challenge.examples} />

            <div className="practice-brief-grid">
              <section>
                <h2>Constraints</h2>
                <ul className="practice-list">
                  {challenge.constraints.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </section>
              <section>
                <h2>Hints</h2>
                <div className="hint-stack">
                  {challenge.hints.slice(0, visibleHintCount).map((hint) => <p key={hint}>{hint}</p>)}
                  <button className="button secondary" type="button" disabled={visibleHintCount >= challenge.hints.length} onClick={() => setHintCount((count) => count + 1)}>
                    Reveal Hint
                  </button>
                </div>
              </section>
            </div>

            <section className="custom-test-panel">
              <div className="label-row">
                <h2>Custom Test</h2>
                <span className="field-value">JSON</span>
              </div>
              <label className="field-label" htmlFor="customArgs">Args array</label>
              <input id="customArgs" value={customArgs} onChange={(event) => setCustomArgs(event.target.value)} />
              <label className="field-label" htmlFor="customExpected">Expected</label>
              <input id="customExpected" value={customExpected} onChange={(event) => setCustomExpected(event.target.value)} />
            </section>
          </article>

          <article className="practice-editor-panel code-workbench-panel">
            <div className="label-row">
              <h2>{challenge.entry}()</h2>
              <span className="field-value">{lineCount} lines</span>
            </div>
            <div className="editor-shell">
              <LineNumbers code={code} />
              <textarea className="code-editor advanced" spellCheck="false" value={code} onChange={(event) => setCode(event.target.value)} />
            </div>
          </article>

          <aside className="practice-results-panel advanced-results">
            <div className="panel-heading compact">
              <p className="eyebrow">Test Runner</p>
              <h2>{results.length ? `${passedCount}/${results.length} passed` : "Ready"}</h2>
            </div>

            <div className="practice-score-grid">
              <article><span>Status</span><strong>{allPassed ? "Solved" : anyFailed ? "Debug" : "Ready"}</strong></article>
              <article><span>Hidden</span><strong>{hiddenPassed}/{hiddenTotal}</strong></article>
              <article><span>Runtime</span><strong>{totalMs ? `${totalMs.toFixed(2)} ms` : "0 ms"}</strong></article>
            </div>

            <div className={`practice-feedback show ${feedback.type}`}>
              {feedback.message}
            </div>

            <div className="test-results advanced">
              {testGroups.map((group) => {
                const groupedTests = testsForDisplay.filter((test) => test.group === group);
                if (!groupedTests.length) return null;
                return (
                  <section className="test-group" key={group}>
                    <h2>{group}</h2>
                    {groupedTests.map((test, index) => (
                      <TestCase
                        fallback={test}
                        index={index}
                        key={`${challengeId}-${group}-${test.name}`}
                        result={results.find((result) => result.group === group && result.name === test.name)}
                      />
                    ))}
                  </section>
                );
              })}
            </div>

            <section className="console-panel">
              <div className="label-row">
                <h2>Console</h2>
                <span className="field-value">{logs.length} logs</span>
              </div>
              <div className="console-output">
                {logs.length ? logs.map((log, index) => (
                  <code className={log.type} key={`${log.message}-${index}`}>{log.message}</code>
                )) : <code>No console output.</code>}
              </div>
            </section>
          </aside>
        </section>
      </section>
    </main>
  );
}
