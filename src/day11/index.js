import run from "aocrunner"
import _ from "lodash"
import { parseGrid } from "../utils/index.js"

const parseInput = (rawInput) => parseGrid(rawInput)

const isEmpty = (list) => list.every((item) => item === ".")

const getXOffsets = (grid, multiplier) => {
  const sizes = new Array(grid[0].length).fill(1)

  for (let x = 1; x < grid[0].length; x++) {
    const column = []
    for (let y = 0; y < grid.length; y++) {
      column.push(grid[y][x])
    }

    const isEmptyColumn = isEmpty(column)
    if (isEmptyColumn) {
      sizes[x] = 1 * multiplier
    } else {
      sizes[x] = 1
    }
  }

  const offsets = [sizes[0]]
  for (let i = 1; i < sizes.length; i++) {
    offsets.push(offsets[i - 1] + sizes[i])
  }

  return offsets
}

const getYOffsets = (grid, multiplier) => {
  const sizes = new Array(grid.length).fill(0)
  for (let y = 1; y < grid.length; y++) {
    const isEmptyRow = isEmpty(grid[y])
    if (isEmptyRow) {
      sizes[y] = 1 * multiplier
    } else {
      sizes[y] = 1
    }
  }

  const offsets = [sizes[0]]
  for (let i = 1; i < sizes.length; i++) {
    offsets.push(offsets[i - 1] + sizes[i])
  }

  return offsets
}

const getDistances = (grid, multiplier) => {
  const xOffsets = getXOffsets(grid, multiplier)
  const yOffsets = getYOffsets(grid, multiplier)

  const galaxies = []
  let counter = 1
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[0].length; x++) {
      if (grid[y][x] === "#") {
        const xOffset = xOffsets[x]
        const yOffset = yOffsets[y]
        galaxies.push([xOffset, yOffset, counter])
        counter++
      }
    }
  }

  const distances = {}
  for (let i = 0; i < galaxies.length; i++) {
    for (let j = 0; j < galaxies.length; j++) {
      if (i === j) {
        continue
      }

      const a = galaxies[Math.min(i, j)]
      const b = galaxies[Math.max(i, j)]
      const key = `(${a[0]},${a[1]}):(${b[0]},${b[1]})`
      if (key in distances) {
        continue
      }

      distances[key] = Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1])
    }
  }

  return _.sum(_.values(distances))
}

const part1 = (rawInput) => {
  const grid = parseInput(rawInput)
  return getDistances(grid, 2)
}

const part2 = (rawInput) => {
  const grid = parseInput(rawInput)
  return getDistances(grid, 1000000)
}

run({
  part1: {
    tests: [
      {
        input: `
...#......
.......#..
#.........
..........
......#...
.#........
.........#
..........
.......#..
#...#.....`,
        expected: 374,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
})
