export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function makeArray(size, min = 8, max = 96) {
  return Array.from({ length: size }, () => randomInt(min, max));
}

export function makeSortedUniqueArray(size) {
  const values = new Set();
  while (values.size < size) values.add(randomInt(4, 98));
  return [...values].sort((a, b) => a - b);
}

export function range(start, end) {
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

export function sameJson(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}
