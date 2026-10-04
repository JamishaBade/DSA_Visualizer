export function buildBinarySearchSteps(values, target) {
  const steps = [];
  let low = 0;
  let high = values.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const value = values[mid];
    const found = value === target;
    steps.push({
      type: "binary",
      low,
      high,
      mid,
      target,
      found,
      message: found ? `Found ${target} at index ${mid}.` : `Middle index ${mid} holds ${value}.`,
      comparisons: 1,
      line: 1,
    });
    if (found) break;
    if (value < target) {
      low = mid + 1;
      steps.push({ type: "binary", low, high, mid: -1, target, message: `${value} is too small. Move low to ${low}.`, comparisons: 0, line: 2 });
    } else {
      high = mid - 1;
      steps.push({ type: "binary", low, high, mid: -1, target, message: `${value} is too large. Move high to ${high}.`, comparisons: 0, line: 3 });
    }
  }

  if (!steps.some((step) => step.found)) {
    steps.push({ type: "binary", low, high, mid: -1, target, notFound: true, message: `${target} is not in the array.`, comparisons: 0, line: 3 });
  }
  return steps;
}

export function buildLinearSearchSteps(values, target) {
  const steps = values.map((value, index) => ({
    type: "linearSearch",
    current: index,
    target,
    found: value === target,
    message: value === target ? `Found ${target} at index ${index}.` : `${value} is not ${target}; move right.`,
    comparisons: 1,
    line: value === target ? 1 : 2,
  }));

  if (!steps.some((step) => step.found)) {
    steps.push({ type: "linearSearch", current: -1, target, notFound: true, message: `${target} is not in the array.`, comparisons: 0, line: 3 });
  }
  return steps;
}
