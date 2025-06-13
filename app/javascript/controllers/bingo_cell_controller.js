import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["mark"]
  static values = { index: Number }

  connect() {
    // Register this cell with the parent
    this.element.bingoCellController = this
    if (!window.bingoCells) window.bingoCells = []
    window.bingoCells.push(this)

    if (this.element.dataset.bingoCellFree === "true") {
      this.markTarget.style.display = "none";
      // Force reflow
      void this.element.offsetWidth;
      this.element.classList.add("animate-pulse");
      this.element.style.backgroundColor = '#fbbf24'; // Amber-400 for debug
      setTimeout(() => {
        this.element.classList.remove("animate-pulse");
        this.element.style.backgroundColor = '';
        this.markTarget.style.display = "";
      }, 2000);
    }
  }

  disconnect() {
    // Remove from global list
    window.bingoCells = window.bingoCells.filter(c => c !== this)
  }

  toggle() {
    this.markTarget.classList.toggle("hidden")
    this.checkBingo()
  }

  isMarked() {
    return !this.markTarget.classList.contains("hidden")
  }

  checkBingo() {
    // 5x5 grid, 25 cells
    const size = 5
    const cells = window.bingoCells
    if (!cells || cells.length !== 25) return
    // Build a 2D array of marked states
    const marked = Array(size).fill().map((_, r) => Array(size).fill(false))
    cells.forEach((cell, i) => {
      const row = Math.floor(i / size)
      const col = i % size
      marked[row][col] = cell.isMarked()
    })
    // The center cell (2,2) is always marked (FREE)
    marked[2][2] = true
    // Check rows, columns, diagonals
    let bingo = false
    for (let i = 0; i < size; i++) {
      if (marked[i].every(Boolean)) bingo = true
      if (marked.map(row => row[i]).every(Boolean)) bingo = true
    }
    if ([0,1,2,3,4].every(i => marked[i][i])) bingo = true
    if ([0,1,2,3,4].every(i => marked[i][4-i])) bingo = true
    // Dispatch event if bingo
    if (bingo) {
      document.dispatchEvent(new CustomEvent("bingo:win"))
    }
  }
} 