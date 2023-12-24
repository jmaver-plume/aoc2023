import run from "aocrunner"
import _ from "lodash"

const Direction = {
  L: "L",
  R: "R",
  U: "U",
  D: "D",
}

const parseInput = (rawInput) =>
  rawInput.split("\n").map((row) => row.split(""))

const stringify = (beam) => `${beam.row}:${beam.column},${beam.direction}`

const extract = (string) => {
  const [row, column, direction] = string.split(/[:,]/)
  return { row: parseInt(row), column: parseInt(column), direction }
}

const moveLeft = (beam) => ({
  row: beam.row,
  column: beam.column - 1,
  direction: Direction.L,
})

const moveRight = (beam) => ({
  row: beam.row,
  column: beam.column + 1,
  direction: Direction.R,
})

const moveUp = (beam) => ({
  row: beam.row - 1,
  column: beam.column,
  direction: Direction.U,
})

const moveDown = (beam) => ({
  row: beam.row + 1,
  column: beam.column,
  direction: Direction.D,
})

const getNextBeams = (grid, beam) => {
  const nextBeams = []
  const value = grid[beam.row][beam.column]

  if (beam.direction === Direction.R) {
    if (value === "|") {
      nextBeams.push(moveUp(beam), moveDown(beam))
    } else if (value === "-" || value === ".") {
      nextBeams.push(moveRight(beam))
    } else if (value === "/") {
      nextBeams.push(moveUp(beam))
    } else if (value === "\\") {
      nextBeams.push(moveDown(beam))
    }
  }

  if (beam.direction === Direction.L) {
    if (value === "|") {
      nextBeams.push(moveUp(beam), moveDown(beam))
    } else if (value === "-" || value === ".") {
      nextBeams.push(moveLeft(beam))
    } else if (value === "/") {
      nextBeams.push(moveDown(beam))
    } else if (value === "\\") {
      nextBeams.push(moveUp(beam))
    }
  }

  if (beam.direction === Direction.U) {
    if (value === "|" || value === ".") {
      nextBeams.push(moveUp(beam))
    } else if (value === "-") {
      nextBeams.push(moveLeft(beam), moveRight(beam))
    } else if (value === "/") {
      nextBeams.push(moveRight(beam))
    } else if (value === "\\") {
      nextBeams.push(moveLeft(beam))
    }
  }

  if (beam.direction === Direction.D) {
    const value = grid[beam.row][beam.column]
    if (value === "|" || value === ".") {
      nextBeams.push(moveDown(beam))
    } else if (value === "-") {
      nextBeams.push(moveLeft(beam), moveRight(beam))
    } else if (value === "/") {
      nextBeams.push(moveLeft(beam))
    } else if (value === "\\") {
      nextBeams.push(moveRight(beam))
    }
  }

  // filter out beams that are out of bounds
  return nextBeams.filter(
    ({ row, column }) =>
      row >= 0 && row < grid.length && column >= 0 && column < grid[0].length,
  )
}

const getEnergizedTileCount = (grid, start) => {
  const visited = new Set()

  const beams = [start]

  while (beams.length) {
    const beam = beams.pop()
    const stringified = stringify(beam)
    if (visited.has(stringified)) {
      continue
    }

    const next = getNextBeams(grid, beam)
    next.forEach((beam) => {
      beams.push(beam)
    })

    visited.add(stringified)
  }

  return new Set(
    Array.from(visited)
      .map((v) => extract(v))
      .map(({ row, column }) => `${row}:${column}`),
  ).size
}

const part1 = (rawInput) => {
  const grid = parseInput(rawInput)
  const start = { row: 0, column: 0, direction: Direction.R }
  return getEnergizedTileCount(grid, start)
}

const part2 = (rawInput) => {
  const grid = parseInput(rawInput)

  const starts = []
  for (let column = 0; column < grid[0].length; column++) {
    starts.push({ row: 0, column, direction: Direction.D })
    starts.push({ row: grid.length - 1, column, direction: Direction.U })
  }
  for (let row = 0; row < grid.length; row++) {
    starts.push({ row, column: 0, direction: Direction.R })
    starts.push({ row, column: grid[0].length - 1, direction: Direction.L })
  }

  return _.max(starts.map((start) => getEnergizedTileCount(grid, start)))
}

run({
  part1: {
    tests: [
      {
        input: `
.|...\\....
|.-.\\.....
.....|-...
........|.
..........
.........\\
..../.\\\\..
.-.-/..|..
.|....-|.\\
..//.|....`,
        expected: 46,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `
.|...\\....
|.-.\\.....
.....|-...
........|.
..........
.........\\
..../.\\\\..
.-.-/..|..
.|....-|.\\
..//.|....`,
        expected: 51,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
})
