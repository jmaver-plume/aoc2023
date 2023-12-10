import run from "aocrunner"
import _ from "lodash"

const Direction = {
  WEST: "WEST",
  NORTH: "NORTH",
  EAST: "EAST",
  SOUTH: "SOUTH",
}

const START_SYMBOL = "S"

const Movement = {
  WEST: { x: -1, y: 0 },
  NORTH: { x: 0, y: -1 },
  EAST: { x: 1, y: 0 },
  SOUTH: { x: 0, y: 1 },
}

const Cache = {
  EMPTY: "E",
  LOOP: "1",
  OUTSIDE: "O",
}

function Position(x, y) {
  this.x = x
  this.y = y
}
Position.prototype.move = function (movement) {
  const { x, y } = movement
  const newX = this.x + x
  const newY = this.y + y
  return new Position(newX, newY)
}
Position.prototype.equals = function (position) {
  return this.x === position.x && this.y === position.y
}

function GridSymbol(symbol) {}
GridSymbol.getDirections = function (symbol) {
  if (symbol === "|") {
    return [Direction.NORTH, Direction.SOUTH]
  }

  if (symbol === "-") {
    return [Direction.EAST, Direction.WEST]
  }

  if (symbol === "L") {
    return [Direction.NORTH, Direction.EAST]
  }

  if (symbol === "J") {
    return [Direction.NORTH, Direction.WEST]
  }

  if (symbol === "7") {
    return [Direction.SOUTH, Direction.WEST]
  }

  if (symbol === "F") {
    return [Direction.SOUTH, Direction.EAST]
  }

  if (symbol === ".") {
    return []
  }

  throw new Error(`Unknown symbol ${symbol}!`)
}

const findStartPosition = (grid) => {
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[0].length; x++) {
      const value = grid[y][x]
      if (value === START_SYMBOL) {
        return new Position(x, y)
      }
    }
  }

  throw new Error("Invalid grid. Starting position is missing!")
}

const isValidPosition = (grid, position) => {
  const { x, y } = position
  return x >= 0 && x < grid[0].length && y >= 0 && y < grid.length
}

const getNeighbours = function (grid, position) {
  let value = grid[position.y][position.x]
  if (value === START_SYMBOL) {
    value = computeStartSymbol(grid)
  }
  const movements = GridSymbol.getDirections(value)
  return movements
    .map((movement) => position.move(Movement[movement]))
    .filter((neighbour) => isValidPosition(grid, neighbour))
}

const arePositionsConnected = (grid, a, b) => {
  const aNeighbours = getNeighbours(grid, a)
  const bNeighbours = getNeighbours(grid, b)

  const aIsReachableFromB = bNeighbours.some((neighbour) => neighbour.equals(a))
  const bIsReachableFromA = aNeighbours.some((neighbour) => neighbour.equals(b))

  return aIsReachableFromB && bIsReachableFromA
}

const getConnectedNeighbours = (grid, position) => {
  const allNeighbours = getNeighbours(grid, position)
  return allNeighbours.filter((neighbour) =>
    arePositionsConnected(grid, neighbour, position),
  )
}

const computeStartSymbol = (grid) => {
  const start = findStartPosition(grid)

  const candidates = ["|", "-", "L", "J", "7", "F"]
  const accepted = candidates
    .map((candidate) => {
      grid[start.y][start.x] = candidate
      return {
        candidate,
        accepted: getConnectedNeighbours(grid, start).length === 2,
      }
    })
    .filter(({ accepted }) => accepted)
    .map(({ candidate }) => candidate)

  if (accepted.length !== 1) {
    throw new Error(`Multiple options for starting position! ${accepted}`)
  }

  grid[start.y][start.x] = START_SYMBOL
  return accepted[0]
}

const createEmptyGrid = (rows, columns) => {
  const grid = []
  for (let y = 0; y < rows; y++) {
    const row = []
    for (let x = 0; x < columns; x++) {
      row.push(Cache.EMPTY)
    }
    grid.push(row)
  }

  return grid
}

const parseInput = (rawInput) =>
  rawInput.split("\n").map((line) => line.split(""))

const part1 = (rawInput) => {
  const grid = parseInput(rawInput)
  const start = findStartPosition(grid)
  grid[start.y][start.x] = computeStartSymbol(grid)

  const cache = createEmptyGrid(grid.length, grid[0].length)

  const queue = [{ position: start, distance: 0 }]
  let result = -1
  while (queue.length !== 0) {
    const { position, distance } = queue.shift()
    if (cache[position.y][position.x] !== Cache.EMPTY) {
      continue
    }

    cache[position.y][position.x] = Cache.LOOP
    result = distance
    const neighbours = getConnectedNeighbours(grid, position)
    neighbours.forEach((neighbour) => {
      queue.push({ position: neighbour, distance: distance + 1 })
    })
  }

  return result
}

const part2 = (rawInput) => {
  const double = (grid) => {
    const rowsWithDoubledColumns = []

    // double columns
    for (let y = 0; y < grid.length; y++) {
      const row = [grid[y][0]]
      for (let x = 1; x < grid[0].length; x++) {
        const prev = _.last(row)
        const next = grid[y][x]
        // Positions are connected if prev has east interface and next has west interface
        const connected =
          ["-", "L", "F"].includes(prev) && ["-", "J", "7"].includes(next)
        const middle = connected ? "-" : "."
        row.push(middle)
        row.push(next)
      }
      rowsWithDoubledColumns.push(row)
    }

    // double rows
    const double = [rowsWithDoubledColumns[0]]
    for (let y = 1; y < grid.length; y++) {
      const prev = _.last(double)
      const middle = []
      const next = rowsWithDoubledColumns[y]
      for (let x = 0; x < prev.length; x++) {
        // Positions are connected if prev has south interface and next has north interface
        const connected =
          ["|", "7", "F"].includes(prev[x]) && ["|", "L", "J"].includes(next[x])
        const value = connected ? "|" : "."
        middle.push(value)
      }
      double.push(middle)
      double.push(next)
    }

    // We are adding an empty value to the border so that we can perform a single "flood fill".
    // Add empty row to the start
    double.unshift(_.range(double[0].length).map((v) => "."))

    // Add empty row to the end
    double.push(_.range(double[0].length).map((v) => "."))
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[0].length; x++) {}
    }

    // Add empty columns to the start and end of each row
    for (let y = 0; y < double.length; y++) {
      double[y].unshift(".")
      double[y].push(".")
    }
    return double
  }

  const half = (grid) => {
    // Remove first and last rows
    grid.shift()
    grid.pop()

    // Remove first and last columns
    for (let y = 0; y < grid.length; y++) {
      grid[y].shift()
      grid[y].pop()
    }

    return grid
      .map((row) => row.filter((_, index) => index % 2 === 0))
      .filter((_, index) => index % 2 === 0)
  }

  const grid = parseInput(rawInput)
  const start = findStartPosition(grid)

  grid[start.y][start.x] = computeStartSymbol(grid)

  const doubledGrid = double(grid)
  const doubledStart = new Position(start.x * 2 + 1, start.y * 2 + 1)

  const cache = createEmptyGrid(doubledGrid.length, doubledGrid[0].length)

  // Mark all nodes that are part of the pipe loop!
  const bfsQueue = [doubledStart]
  while (bfsQueue.length !== 0) {
    const position = bfsQueue.shift()

    // We already visited this node, and it's part of the loop!
    if (cache[position.y][position.x] !== Cache.EMPTY) {
      continue
    }

    // Mark the node as visited!
    cache[position.y][position.x] = Cache.LOOP

    const neighbours = getConnectedNeighbours(doubledGrid, position)
    neighbours.forEach((neighbour) => {
      bfsQueue.push(neighbour)
    })
  }

  // Mark all nodes that are part of the outside!
  const floodFillQueue = [new Position(0, 0)]
  while (floodFillQueue.length) {
    const position = floodFillQueue.shift()
    if (cache[position.y][position.x] !== Cache.EMPTY) {
      continue
    }

    // Mark the node as outside!
    cache[position.y][position.x] = Cache.OUTSIDE

    // Find all neighbours that are not visited in the cache.
    const neighbours = [
      Movement.EAST,
      Movement.WEST,
      Movement.NORTH,
      Movement.SOUTH,
    ]
      .map((m) => position.move(m))
      .filter(
        (p) =>
          isValidPosition(doubledGrid, p) && cache[p.y][p.x] === Cache.EMPTY,
      )
    neighbours.forEach((neighbour) => {
      floodFillQueue.push(neighbour)
    })
  }

  // Calculate sum
  const halvedCache = half(cache)
  let sum = 0
  for (let y = 0; y < halvedCache.length; y++) {
    for (let x = 0; x < halvedCache[0].length; x++) {
      if (halvedCache[y][x] === Cache.EMPTY) {
        sum += 1
      }
    }
  }
  return sum
}

run({
  part1: {
    tests: [
      //       {
      //         input: `-L|F7
      // 7S-7|
      // L|7||
      // -L-J|
      // L|-JF`,
      //         expected: 4,
      //       },
      //       {
      //         input: `7-F7-
      // .FJ|7
      // SJLL7
      // |F--J
      // LJ.LJ`,
      //         expected: 8,
      //       },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `..........
.S------7.
.|F----7|.
.||....||.
.||....||.
.|L-7F-J|.
.|..||..|.
.L--JL--J.
..........`,
        expected: 4,
      },
      {
        input: `FF7FSF7F7F7F7F7F---7
L|LJ||||||||||||F--J
FL-7LJLJ||||||LJL-77
F--JF--7||LJLJ7F7FJ-
L---JF-JLJ.||-FJLJJ7
|F|F-JF---7F7-L7L|7|
|FFJF7L7F-JF7|JL---7
7-L-JL7||F7|L7F-7F7|
L.L7LFJ|||||FJL7||LJ
L7JLJL-JLJLJL--JLJ.L`,
        expected: 10,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
})
