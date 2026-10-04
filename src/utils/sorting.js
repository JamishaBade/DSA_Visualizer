import { range } from "./array";

export function buildSortSteps(values, algorithm) {
  const arr = [...values];
  const steps = [];
  const sorted = new Set();

  const snapshot = (action, highlight = {}, line = 0, comparisons = 0, writes = 0) => {
    steps.push({
      array: [...arr],
      action,
      highlight: {
        ...highlight,
        sorted: [...new Set([...(highlight.sorted || []), ...sorted])],
      },
      line,
      comparisons,
      writes,
    });
  };

  const swap = (i, j) => {
    [arr[i], arr[j]] = [arr[j], arr[i]];
  };

  if (algorithm === "bubble") {
    for (let i = 0; i < arr.length - 1; i += 1) {
      let swapped = false;
      for (let j = 0; j < arr.length - i - 1; j += 1) {
        snapshot(`Compare ${arr[j]} and ${arr[j + 1]}.`, { compare: [j, j + 1] }, 1, 1, 0);
        if (arr[j] > arr[j + 1]) {
          swap(j, j + 1);
          swapped = true;
          snapshot(`Swap ${arr[j + 1]} with ${arr[j]}.`, { active: [j, j + 1] }, 2, 0, 2);
        }
      }
      sorted.add(arr.length - i - 1);
      snapshot(`Position ${arr.length - i} is sorted.`, {}, 3, 0, 0);
      if (!swapped) break;
    }
    arr.forEach((_, index) => sorted.add(index));
    snapshot("Array sorted.", {}, 3, 0, 0);
  }

  if (algorithm === "selection") {
    for (let i = 0; i < arr.length - 1; i += 1) {
      let minIndex = i;
      snapshot(`Start scanning for the minimum from index ${i}.`, { active: [i] }, 0, 0, 0);
      for (let j = i + 1; j < arr.length; j += 1) {
        snapshot(`Compare ${arr[j]} with current minimum ${arr[minIndex]}.`, { compare: [minIndex, j] }, 2, 1, 0);
        if (arr[j] < arr[minIndex]) {
          minIndex = j;
          snapshot(`${arr[minIndex]} is the new minimum.`, { active: [minIndex] }, 1, 0, 0);
        }
      }
      if (minIndex !== i) {
        swap(i, minIndex);
        snapshot(`Move ${arr[i]} into position ${i}.`, { active: [i, minIndex] }, 3, 0, 2);
      }
      sorted.add(i);
      snapshot(`Position ${i + 1} is fixed.`, {}, 3, 0, 0);
    }
    arr.forEach((_, index) => sorted.add(index));
    snapshot("Array sorted.", {}, 3, 0, 0);
  }

  if (algorithm === "insertion") {
    sorted.add(0);
    for (let i = 1; i < arr.length; i += 1) {
      const key = arr[i];
      let j = i - 1;
      snapshot(`Take ${key} as the next key.`, { active: [i] }, 0, 0, 0);
      while (j >= 0 && arr[j] > key) {
        snapshot(`Compare ${arr[j]} with key ${key}.`, { compare: [j, j + 1] }, 2, 1, 0);
        arr[j + 1] = arr[j];
        snapshot(`Shift ${arr[j]} right.`, { active: [j, j + 1] }, 2, 0, 1);
        j -= 1;
      }
      arr[j + 1] = key;
      for (let k = 0; k <= i; k += 1) sorted.add(k);
      snapshot(`Insert ${key} at index ${j + 1}.`, { active: [j + 1] }, 3, 0, 1);
    }
    arr.forEach((_, index) => sorted.add(index));
    snapshot("Array sorted.", {}, 3, 0, 0);
  }

  if (algorithm === "merge") {
    const mergeSort = (left, right) => {
      if (left >= right) return;
      const mid = Math.floor((left + right) / 2);
      snapshot(`Split range ${left} to ${right}.`, { active: range(left, right) }, 0, 0, 0);
      mergeSort(left, mid);
      mergeSort(mid + 1, right);
      const merged = [];
      let i = left;
      let j = mid + 1;
      while (i <= mid && j <= right) {
        snapshot(`Compare ${arr[i]} and ${arr[j]}.`, { compare: [i, j] }, 2, 1, 0);
        if (arr[i] <= arr[j]) {
          merged.push(arr[i]);
          i += 1;
        } else {
          merged.push(arr[j]);
          j += 1;
        }
      }
      while (i <= mid) {
        merged.push(arr[i]);
        i += 1;
      }
      while (j <= right) {
        merged.push(arr[j]);
        j += 1;
      }
      merged.forEach((value, offset) => {
        arr[left + offset] = value;
        snapshot(`Write ${value} back into index ${left + offset}.`, { active: [left + offset] }, 3, 0, 1);
      });
    };
    mergeSort(0, arr.length - 1);
    arr.forEach((_, index) => sorted.add(index));
    snapshot("Array sorted.", {}, 3, 0, 0);
  }

  if (algorithm === "quick") {
    const partition = (low, high) => {
      const pivot = arr[high];
      let i = low;
      snapshot(`Choose ${pivot} as pivot.`, { active: [high] }, 0, 0, 0);
      for (let j = low; j < high; j += 1) {
        snapshot(`Compare ${arr[j]} with pivot ${pivot}.`, { compare: [j, high] }, 1, 1, 0);
        if (arr[j] <= pivot) {
          if (i !== j) {
            swap(i, j);
            snapshot(`Move ${arr[i]} before the pivot.`, { active: [i, j] }, 1, 0, 2);
          }
          i += 1;
        }
      }
      swap(i, high);
      sorted.add(i);
      snapshot(`Pivot ${arr[i]} lands at index ${i}.`, { active: [i] }, 2, 0, 2);
      return i;
    };

    const quickSort = (low, high) => {
      if (low > high) return;
      if (low === high) {
        sorted.add(low);
        snapshot(`${arr[low]} is already fixed.`, { active: [low] }, 3, 0, 0);
        return;
      }
      const pivotIndex = partition(low, high);
      quickSort(low, pivotIndex - 1);
      quickSort(pivotIndex + 1, high);
    };
    quickSort(0, arr.length - 1);
    arr.forEach((_, index) => sorted.add(index));
    snapshot("Array sorted.", {}, 3, 0, 0);
  }

  return steps;
}
