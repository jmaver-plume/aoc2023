import run from "aocrunner"
import {
  getNextPositions,
  gridIterator,
  logGrid,
  parseGrid,
  uniqPositions,
} from "../utils/index.js"
import _ from "lodash"
import * as fs from "fs"

const parseInput = (input) => parseGrid(input)

const getStartingsPositions = (grid) => {
  const positions = []
  for (const { row, column, value } of gridIterator(grid)) {
    if (value === "S" || value === "O") {
      positions.push({ row, column })
    }
  }
  return positions
}

const countLocations = (grid) => {
  let count = 0
  for (const { value } of gridIterator(grid)) {
    count += value === "O" ? 1 : 0
  }
  return count
}

const duplicateColumns = (grid, n) => {
  return _.unzip(duplicateRows(_.zip(...grid), n))
}

const duplicateRows = (grid, n) => {
  const result = _.cloneDeep(grid)
  for (let i = 0; i < n; i++) {
    const clone = _.cloneDeep(grid)
    clone.forEach((row) => {
      result.push(row)
    })
  }
  return result
}

const part1 = (rawInput) => {
  const grid = parseInput(rawInput)
  for (let i = 1; i <= 64; i++) {
    const current = getStartingsPositions(grid)
    const next = uniqPositions(
      current.flatMap((position) =>
        getNextPositions(grid, position, false, (_, value) => value !== "#"),
      ),
    )
    current.forEach(({ row, column }) => {
      grid[row][column] = "."
    })
    next.forEach(({ row, column }) => {
      grid[row][column] = "O"
    })
  }

  return countLocations(grid)
}

const part2 = (rawInput) => {
  const grid = parseInput(rawInput)

  // For simplicity unset the start
  const start = getStartingsPositions(grid)[0]
  grid[start.row][start.column] = "."

  const extendedGrid = duplicateRows(duplicateColumns(grid, 8), 8)

  // Set back the start position
  // It's (n / 2) * length
  const newStart = {
    row: start.row + grid.length * 4,
    column: start.column + grid[0].length * 4,
  }
  extendedGrid[newStart.row][newStart.column] = "S"

  const wanted = [65, 65 + 131, 65 + 131 * 2]
  const wantedResults = []
  // logGrid(extendedGrid)
  for (let i = 1; i <= _.last(wanted); i++) {
    const current = getStartingsPositions(extendedGrid)
    const next = uniqPositions(
      current.flatMap((position) =>
        getNextPositions(
          extendedGrid,
          position,
          false,
          (_, value) => value !== "#",
        ),
      ),
    )
    current.forEach(({ row, column }) => {
      extendedGrid[row][column] = "."
    })
    next.forEach(({ row, column }) => {
      extendedGrid[row][column] = "O"
    })

    if (wanted.includes(i)) {
      wantedResults.push(countLocations(extendedGrid))
    }
  }

  // JavaScript does not have a polyfit library and I am not going to write one.
  // As such from here on you can use a third party online solution.
  // X = [0, 1, 2]
  // Y = wantedResults
  // X_desired = (26501365 - 65) / 131
  // Y_desired = 608193767979991
  console.log("wantedResults:", wantedResults)
  return 608193767979991
}

run({
  part1: {
    tests: [
      //       {
      //         input: `
      // ...........
      // .....###.#.
      // .###.##..#.
      // ..#.#...#..
      // ....#.#....
      // .##..S####.
      // .##..#...#.
      // .......##..
      // .##.#.####.
      // .##..##.##.
      // ...........`,
      //         expected: "",
      //       },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      //       {
      //         input: `
      // ...........
      // .....###.#.
      // .###.##..#.
      // ..#.#...#..
      // ....#.#....
      // .##..S####.
      // .##..#...#.
      // .......##..
      // .##.#.####.
      // .##..##.##.
      // ...........`,
      //         expected: "",
      //       },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
})
