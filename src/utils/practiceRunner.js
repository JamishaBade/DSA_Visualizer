export function formatJson(value) {
  return JSON.stringify(value);
}

export function parseJsonField(value, label) {
  try {
    return JSON.parse(value);
  } catch {
    throw new Error(`${label} must be valid JSON.`);
  }
}

export function runPracticeCode({ code, entry, tests }) {
  const workerSource = `
    const sameJson = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    const clone = (value) => JSON.parse(JSON.stringify(value));

    self.onmessage = (event) => {
      const { code, entry, tests } = event.data;
      const logs = [];
      const userConsole = {
        log: (...items) => logs.push({ type: "log", message: items.map((item) => typeof item === "string" ? item : JSON.stringify(item)).join(" ") }),
        warn: (...items) => logs.push({ type: "warn", message: items.map((item) => typeof item === "string" ? item : JSON.stringify(item)).join(" ") }),
        error: (...items) => logs.push({ type: "error", message: items.map((item) => typeof item === "string" ? item : JSON.stringify(item)).join(" ") }),
      };

      try {
        const getFunction = new Function("console", code + "\\nreturn typeof " + entry + " === 'function' ? " + entry + " : null;");
        const fn = getFunction(userConsole);

        if (!fn) {
          self.postMessage({ type: "error", message: "Could not find function " + entry + ".", logs });
          return;
        }

        const startedAll = performance.now();
        const results = tests.map((test, index) => {
          const args = clone(test.args);
          const started = performance.now();
          const actual = fn(...args);
          const elapsed = performance.now() - started;
          return {
            index,
            name: test.name,
            group: test.group,
            reveal: test.reveal,
            custom: test.custom,
            args: test.args,
            expected: test.expected,
            actual,
            elapsed,
            pass: sameJson(actual, test.expected),
          };
        });

        self.postMessage({ type: "done", results, logs, totalMs: performance.now() - startedAll });
      } catch (error) {
        self.postMessage({ type: "error", message: error && error.message ? error.message : String(error), logs });
      }
    };
  `;

  return new Promise((resolve) => {
    const url = URL.createObjectURL(new Blob([workerSource], { type: "text/javascript" }));
    const worker = new Worker(url);
    const timer = window.setTimeout(() => {
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve({ type: "error", message: "Execution timed out. Check for an infinite loop.", logs: [] });
    }, 1800);

    worker.onmessage = (event) => {
      window.clearTimeout(timer);
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve(event.data);
    };

    worker.postMessage({ code, entry, tests });
  });
}
