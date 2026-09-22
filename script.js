// Sorting Algorithm Visualizer
// Each algorithm is a generator function that yields "steps" describing
// what to highlight on the bars. A single render loop consumes whichever
// generator is active, so adding a new algorithm only means adding a new
// generator function below.

const stage = document.getElementById('stage');
const algoSelect = document.getElementById('algo');
const sizeSlider = document.getElementById('size');
const speedSlider = document.getElementById('speed');
const sizeVal = document.getElementById('sizeVal');
const speedVal = document.getElementById('speedVal');
const shuffleBtn = document.getElementById('shuffleBtn');
const sortBtn = document.getElementById('sortBtn');
const comparisonsEl = document.getElementById('comparisons');
const swapsEl = document.getElementById('swaps');
const accessesEl = document.getElementById('accesses');
const timeEl = document.getElementById('time');

let array = [];
let bars = [];
let sorting = false;
let stats = { comparisons: 0, swaps: 0, accesses: 0 };
let startTime = 0;
let timerId = null;

function randomArray(n) {
  const arr = [];
  for (let i = 0; i < n; i++) arr.push(Math.floor(Math.random() * 94) + 6);
  return arr;
}

function render() {
  stage.innerHTML = '';
  bars = array.map((val) => {
    const bar = document.createElement('div');
    bar.className = 'bar';
    bar.style.height = val + '%';
    stage.appendChild(bar);
    return bar;
  });
}

function resetStats() {
  stats = { comparisons: 0, swaps: 0, accesses: 0 };
  updateStatsDisplay();
}

function updateStatsDisplay() {
  comparisonsEl.textContent = stats.comparisons;
  swapsEl.textContent = stats.swaps;
  accessesEl.textContent = stats.accesses;
}

function newArray() {
  if (sorting) return;
  array = randomArray(parseInt(sizeSlider.value, 10));
  render();
  resetStats();
  timeEl.textContent = '0.0s';
}

function delayMs() {
  // speed 1 = slow (~120ms/step), speed 10 = fast (~2ms/step)
  const speed = parseInt(speedSlider.value, 10);
  return Math.max(2, 130 - speed * 13);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function markClasses(indices, cls) {
  bars.forEach((b, i) => {
    if (indices.includes(i)) b.classList.add(cls);
  });
}

function clearClasses(indices, cls) {
  bars.forEach((b, i) => {
    if (indices.includes(i)) b.classList.remove(cls);
  });
}

function setHeight(i, val) {
  bars[i].style.height = val + '%';
  stats.accesses++;
}

/* ---- Algorithms: each yields step descriptors ---- */

function* bubbleSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      yield { compare: [j, j + 1] };
      stats.comparisons++;
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        stats.swaps++;
        yield { swap: [j, j + 1], values: [arr[j], arr[j + 1]] };
      }
    }
    yield { sorted: [n - i - 1] };
  }
  yield { sorted: [0] };
}

function* selectionSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      yield { compare: [minIdx, j] };
      stats.comparisons++;
      if (arr[j] < arr[minIdx]) minIdx = j;
    }
    if (minIdx !== i) {
      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
      stats.swaps++;
      yield { swap: [i, minIdx], values: [arr[i], arr[minIdx]] };
    }
    yield { sorted: [i] };
  }
}

function* insertionSort(arr) {
  const n = arr.length;
  for (let i = 1; i < n; i++) {
    let j = i;
    while (j > 0) {
      yield { compare: [j - 1, j] };
      stats.comparisons++;
      if (arr[j - 1] > arr[j]) {
        [arr[j - 1], arr[j]] = [arr[j], arr[j - 1]];
        stats.swaps++;
        yield { swap: [j - 1, j], values: [arr[j - 1], arr[j]] };
        j--;
      } else break;
    }
  }
  yield { sorted: arr.map((_, i) => i) };
}

function* mergeSort(arr) {
  function* sort(lo, hi) {
    if (hi - lo <= 1) return;
    const mid = Math.floor((lo + hi) / 2);
    yield* sort(lo, mid);
    yield* sort(mid, hi);
    const left = arr.slice(lo, mid);
    const right = arr.slice(mid, hi);
    let i = 0, j = 0, k = lo;
    while (i < left.length && j < right.length) {
      yield { compare: [lo + i, mid + j] };
      stats.comparisons++;
      if (left[i] <= right[j]) {
        arr[k] = left[i++];
      } else {
        arr[k] = right[j++];
      }
      stats.swaps++;
      yield { swap: [k], values: [arr[k]] };
      k++;
    }
    while (i < left.length) {
      arr[k] = left[i++];
      yield { swap: [k], values: [arr[k]] };
      k++;
    }
    while (j < right.length) {
      arr[k] = right[j++];
      yield { swap: [k], values: [arr[k]] };
      k++;
    }
  }
  yield* sort(0, arr.length);
  yield { sorted: arr.map((_, i) => i) };
}

function* quickSort(arr) {
  function* sort(lo, hi) {
    if (lo >= hi) return;
    const pivot = arr[hi];
    yield { pivot: [hi] };
    let i = lo - 1;
    for (let j = lo; j < hi; j++) {
      yield { compare: [j, hi], pivot: [hi] };
      stats.comparisons++;
      if (arr[j] < pivot) {
        i++;
        [arr[i], arr[j]] = [arr[j], arr[i]];
        stats.swaps++;
        yield { swap: [i, j], values: [arr[i], arr[j]], pivot: [hi] };
      }
    }
    [arr[i + 1], arr[hi]] = [arr[hi], arr[i + 1]];
    stats.swaps++;
    yield { swap: [i + 1, hi], values: [arr[i + 1], arr[hi]] };
    yield { sorted: [i + 1] };
    yield* sort(lo, i);
    yield* sort(i + 2, hi);
  }
  yield* sort(0, arr.length - 1);
  yield { sorted: arr.map((_, i) => i) };
}

const algorithms = {
  bubble: bubbleSort,
  selection: selectionSort,
  insertion: insertionSort,
  merge: mergeSort,
  quick: quickSort,
};

async function runSort() {
  if (sorting) return;
  sorting = true;
  sortBtn.disabled = true;
  shuffleBtn.disabled = true;
  resetStats();
  startTime = performance.now();
  timerId = setInterval(() => {
    timeEl.textContent = ((performance.now() - startTime) / 1000).toFixed(1) + 's';
  }, 100);

  const workingArray = array.slice();
  const gen = algorithms[algoSelect.value](workingArray);
  const delay = delayMs();

  for (const step of gen) {
    if (step.compare) {
      markClasses(step.compare, 'compare');
      if (step.pivot) markClasses(step.pivot, 'pivot');
      await sleep(delay);
      clearClasses(step.compare, 'compare');
    }
    if (step.swap) {
      step.swap.forEach((idx, k) => {
        if (step.values) {
          setHeight(idx, step.values[k]);
          array[idx] = step.values[k];
        }
      });
      markClasses(step.swap, 'swap');
      await sleep(delay);
      clearClasses(step.swap, 'swap');
    }
    if (step.pivot && !step.compare) {
      markClasses(step.pivot, 'pivot');
      await sleep(delay);
      clearClasses(step.pivot, 'pivot');
    }
    if (step.sorted) {
      markClasses(step.sorted, 'sorted');
    }
    updateStatsDisplay();
  }

  clearInterval(timerId);
  timeEl.textContent = ((performance.now() - startTime) / 1000).toFixed(1) + 's';
  bars.forEach((b) => b.classList.add('sorted'));
  sorting = false;
  sortBtn.disabled = false;
  shuffleBtn.disabled = false;
}

sizeSlider.addEventListener('input', () => {
  sizeVal.textContent = sizeSlider.value;
  newArray();
});
speedSlider.addEventListener('input', () => {
  speedVal.textContent = speedSlider.value;
});
shuffleBtn.addEventListener('click', newArray);
sortBtn.addEventListener('click', runSort);

newArray();
