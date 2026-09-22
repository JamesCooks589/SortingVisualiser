# Sorting algorithm visualizer

A vanilla-JS, dependency-free visualizer for five classic sorting algorithms: bubble, selection, insertion, merge, and quick sort.

## Live demo
Open `index.html` in a browser, or enable GitHub Pages on this repo (Settings → Pages → deploy from `main` branch).

## What it shows
- Animated bars with color-coded state: comparing, swapping, pivot (quick sort), sorted
- Live counters for comparisons, swaps and array accesses
- Adjustable array size (10–150 elements) and playback speed
- Each algorithm is implemented as a JS generator function that yields step-by-step state, so the visualization and the algorithm logic stay decoupled — adding a new algorithm only means writing a new generator

## Why generators
Rather than sprinkling `setTimeout` calls through the sorting logic, each algorithm (`bubbleSort`, `quickSort`, etc.) is a plain generator function that yields a description of each step (`{ compare: [i, j] }`, `{ swap: [...], values: [...] }`, `{ sorted: [...] }`). A single animation loop consumes whichever generator is selected and handles all the timing and DOM updates. This keeps the algorithm code readable and close to its textbook form.

## Stack
HTML, CSS, vanilla JavaScript — no build step, no dependencies.
