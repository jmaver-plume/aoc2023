import run from "aocrunner"
import _ from "lodash"

const parseInput = (rawInput) =>
  rawInput.split("\n").map((row) => row.split(""))

const stringify = (grid) => grid.map((row) => row.join("")).join("\n")

const log = (grid) => console.log(stringify(grid) + "\n")

const sum = (grid) => {
  let sum = 0
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[0].length; j++) {
      const value = grid[i][j]
      if (value === "O") {
        sum += grid.length - i
      }
    }
  }

  return sum
}

const tiltNorth = (grid) => {
  const positions = grid[0].map((v) => (v === "." ? 0 : 1))

  for (let i = 1; i < grid.length; i++) {
    for (let j = 0; j < grid[0].length; j++) {
      const value = grid[i][j]
      if (value === "O") {
        if (positions[j] !== i) {
          grid[positions[j]][j] = value
          grid[i][j] = "."
        }

        positions[j] += 1
      } else if (value === "#") {
        positions[j] = i + 1
      }
    }
  }
}

const tiltSouth = (grid) => {
  const positions = grid[grid.length - 1].map((v) =>
    v === "." ? grid.length - 1 : grid.length - 2,
  )

  for (let i = grid.length - 2; i >= 0; i--) {
    for (let j = 0; j < grid[0].length; j++) {
      const value = grid[i][j]
      if (value === "O") {
        if (positions[j] !== i) {
          grid[positions[j]][j] = value
          grid[i][j] = "."
        }

        positions[j] -= 1
      } else if (value === "#") {
        positions[j] = i - 1
      }
    }
  }
}

const tiltWest = (grid) => {
  const positions = []
  for (let i = 0; i < grid.length; i++) {
    const value = grid[i][0]
    const position = value === "." ? 0 : 1
    positions.push(position)
  }

  for (let j = 1; j < grid[0].length; j++) {
    for (let i = 0; i < grid.length; i++) {
      const value = grid[i][j]
      if (value === "O") {
        if (positions[i] !== j) {
          grid[i][positions[i]] = value
          grid[i][j] = "."
        }

        positions[i] += 1
      } else if (value === "#") {
        positions[i] = j + 1
      }
    }
  }
}

const tiltEast = (grid) => {
  const positions = []
  for (let i = 0; i < grid.length; i++) {
    const value = grid[i][grid[0].length - 1]
    const position = value === "." ? grid[0].length - 1 : grid[0].length - 2
    positions.push(position)
  }

  for (let j = grid[0].length - 2; j >= 0; j--) {
    for (let i = 0; i < grid.length; i++) {
      const value = grid[i][j]
      if (value === "O") {
        if (positions[i] !== j) {
          grid[i][positions[i]] = value
          grid[i][j] = "."
        }

        positions[i] -= 1
      } else if (value === "#") {
        positions[i] = j - 1
      }
    }
  }
}

const part1 = (rawInput) => {
  const grid = parseInput(rawInput)
  tiltNorth(grid)

  return sum(grid)
}

const tilt = (grid) => {
  tiltNorth(grid)
  tiltWest(grid)
  tiltSouth(grid)
  tiltEast(grid)
}

const findCycle = (grid) => {
  // Perform a small number of iterations to find the cycle.
  const clonedGrid1 = _.cloneDeep(grid)
  const map = new Map()
  while (true) {
    const string = stringify(clonedGrid1)
    if (map.has(string)) {
      if (map.get(string) > 4) {
        break
      }
      map.set(string, map.get(string) + 1)
    } else {
      map.set(string, 1)
    }
    tilt(clonedGrid1)
  }

  // Helper variable that contains all elements which are present more than once
  const cycleElements = new Set(
    Array.from(map)
      .filter((v) => v[1] !== 1)
      .map((v) => v[0]),
  )

  // Find the first cycle element that occurs and return its position
  const clonedGrid2 = _.cloneDeep(grid)
  for (let i = 0; ; i++) {
    tilt(clonedGrid2)
    const string = stringify(clonedGrid2)
    if (cycleElements.has(string)) {
      return { start: i, size: cycleElements.size }
    }
  }
}

const part2 = (rawInput) => {
  const grid = parseInput(rawInput)
  const cycle = findCycle(grid)

  // cycle until the start of the cycle
  for (let j = 0; j < cycle.start; j++) {
    tilt(grid)
  }

  const remainder = (1000000000 - cycle.start) % cycle.size
  for (let j = 0; j < remainder; j++) {
    tilt(grid)
  }

  return sum(grid)
}

run({
  part1: {
    tests: [
      {
        input: `
O....#....
O.OO#....#
.....##...
OO.#O....O
.O.....O#.
O.#..O.#.#
..O..#O..O
.......O..
#....###..
#OO..#....`,
        expected: "",
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `
O....#....
O.OO#....#
.....##...
OO.#O....O
.O.....O#.
O.#..O.#.#
..O..#O..O
.......O..
#....###..
#OO..#....`,
        expected: 64,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
})
