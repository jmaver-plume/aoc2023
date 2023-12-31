import run from "aocrunner"
import _ from "lodash"
import { getNextPositions, gridIterator, logGrid } from "../utils/index.js"
import chalk from "chalk"
import { MinHeap } from "../utils/min-heap.js"

const Direction = {
  L: "L",
  R: "R",
  U: "U",
  D: "D",
}

const moveLeft = (position) => ({
  row: position.row,
  column: position.column - 1,
  direction: Direction.L,
  count: position.direction === Direction.L ? position.count + 1 : 1,
})

const moveRight = (position) => ({
  row: position.row,
  column: position.column + 1,
  direction: Direction.R,
  count: position.direction === Direction.R ? position.count + 1 : 1,
})

const moveUp = (position) => ({
  row: position.row - 1,
  column: position.column,
  direction: Direction.U,
  count: position.direction === Direction.U ? position.count + 1 : 1,
})

const moveDown = (position) => ({
  row: position.row + 1,
  column: position.column,
  direction: Direction.D,
  count: position.direction === Direction.D ? position.count + 1 : 1,
})

class State {
  constructor(row, column, direction, count) {
    this.row = row
    this.column = column
    this.direction = direction
    this.count = count
  }
}

const parseInput = (rawInput) =>
  rawInput.split("\n").map((line) => line.split("").map((v) => parseInt(v)))

const logPath = (path, grid) => {
  const map = {
    U: "^",
    D: "v",
    R: ">",
    L: "<",
  }
  path.forEach((position) => {
    const [row, column, direction] = position.split(":")
    grid[parseInt(row)][parseInt(column)] = chalk.redBright(map[direction])
  })
  logGrid(grid)
}

export function dijsktraGrid(grid, start, maxDirectionCount, getNeighbours) {
  // Initialization
  const dist = {}
  const prev = {}
  const queue = new MinHeap(
    (a, b) => a.dist - b.dist,
    (v) => v.id,
  )

  for (const { row, column } of gridIterator(grid)) {
    const downCount = Math.min(maxDirectionCount, row + 1)
    for (let i = 1; i <= downCount; i++) {
      const node = `${row}:${column}:D:${i}`
      dist[node] = Infinity
      prev[node] = undefined
      queue.insert({ id: node, dist: Infinity })
    }

    const upCount = Math.min(maxDirectionCount, grid.length - row)
    for (let i = 1; i <= upCount; i++) {
      const node = `${row}:${column}:U:${i}`
      dist[node] = Infinity
      prev[node] = undefined
      queue.insert({ id: node, dist: Infinity })
    }

    const rightCount = Math.min(maxDirectionCount, column + 1)
    for (let i = 1; i <= rightCount; i++) {
      const node = `${row}:${column}:R:${i}`
      dist[node] = Infinity
      prev[node] = undefined
      queue.insert({ id: node, dist: Infinity })
    }

    const leftCount = Math.min(maxDirectionCount, grid[0].length - column)
    for (let i = 1; i <= leftCount; i++) {
      const node = `${row}:${column}:L:${i}`
      dist[node] = Infinity
      prev[node] = undefined
      queue.insert({ id: node, dist: Infinity })
    }
  }

  dist[start] = 0
  prev[start] = undefined
  queue.insert({ id: start, dist: 0 })

  while (!queue.isEmpty()) {
    const { id: node } = queue.extract()

    const neighbours = getNeighbours(grid, node)
    neighbours.forEach((neighbour) => {
      const [neighbourRow, neighbourColumn] = neighbour.split(":")
      // Distance from node to neighbour equals the value of the neighbour in the grid
      const distanceFromNodeToNeighbour =
        grid[parseInt(neighbourRow)][parseInt(neighbourColumn)]
      const alt = dist[node] + distanceFromNodeToNeighbour
      if (alt < dist[neighbour]) {
        dist[neighbour] = alt
        prev[neighbour] = node
        queue.decrease(
          { id: neighbour },
          { id: neighbour, dist: dist[neighbour] },
        )
      }
    })
  }

  return {
    dist: _.pickBy(dist, (value) => value !== Infinity),
    prev: _.pickBy(prev, (value) => value !== undefined),
  }
}

const getNeighboursPart1 = (grid, node) => {
  const [row, column, direction, count] = node.split(":")
  const gridNeighbours = getNextPositions(grid, {
    row: parseInt(row),
    column: parseInt(column),
  })
  const nodeNeighbours = gridNeighbours.map((next) => {
    if (next.direction === direction) {
      return `${next.row}:${next.column}:${direction}:${parseInt(count) + 1}`
    }
    return `${next.row}:${next.column}:${next.direction}:1`
  })
  return nodeNeighbours
    .filter((neighbour) => {
      const count = neighbour.split(":")[3]
      return parseInt(count) <= 3
    })
    .filter((neighbour) => {
      const opposite = {
        D: "U",
        U: "D",
        L: "R",
        R: "L",
      }
      const neighbourDirection = neighbour.split(":")[2]
      return direction !== opposite[neighbourDirection]
    })
}

const part1 = (rawInput) => {
  const grid = parseInput(rawInput)
  const start = `0:0:null:0`
  const result = dijsktraGrid(grid, start, 3, getNeighboursPart1)

  const maxRow = grid.length - 1
  const maxColumn = grid[0].length - 1
  const destinations = ["D", "U", "L", "R"].flatMap((direction) =>
    _.range(1, 4).map((i) => `${maxRow}:${maxColumn}:${direction}:${i}`),
  )
  const paths = destinations.map((destination) => {
    const path = []
    let current = destination
    while (current !== undefined) {
      path.unshift(current)
      current = result.prev[current]
    }
    return path
  })
  const validPaths = paths.filter((path) => path[0] === start)
  const validPathsWithoutFirstElements = validPaths.map((p) => p.slice(1))

  const minPath = _.minBy(validPathsWithoutFirstElements, (path) =>
    _.sum(
      path.map((node) => {
        const [row, column] = node.split(":")
        return grid[parseInt(row)][parseInt(column)]
      }),
    ),
  )
  return _.sum(
    minPath.map((node) => {
      const [row, column] = node.split(":")
      return grid[parseInt(row)][parseInt(column)]
    }),
  )
}

const getNeighboursPart2 = (grid, node) => {
  const [row, column, direction, count] = node.split(":")
  const gridNeighbours = getNextPositions(grid, {
    row: parseInt(row),
    column: parseInt(column),
  })
  const nodeNeighbours = gridNeighbours.map((next) => {
    if (next.direction === direction) {
      return `${next.row}:${next.column}:${direction}:${parseInt(count) + 1}`
    }
    return `${next.row}:${next.column}:${next.direction}:1`
  })
  return nodeNeighbours
    .filter((neighbour) => {
      const count = neighbour.split(":")[3]
      // Max count that you can move in the same direction is 10
      return parseInt(count) <= 10
    })
    .filter((neighbour) => {
      // Cannot move in the opposite direction
      const opposite = {
        D: "U",
        U: "D",
        L: "R",
        R: "L",
      }
      const neighbourDirection = neighbour.split(":")[2]
      return direction !== opposite[neighbourDirection]
    })
    .filter((neighbour) => {
      // Edge case handling for the start node
      if (direction === "null") {
        return true
      }
      // You must move in the same direction for at least 4 moves
      const neighbourDirection = neighbour.split(":")[2]
      return parseInt(count) < 4 ? direction === neighbourDirection : true
    })
}

const part2 = (rawInput) => {
  const grid = parseInput(rawInput)
  const start = `0:0:null:0`
  const result = dijsktraGrid(grid, start, 10, getNeighboursPart2)

  const maxRow = grid.length - 1
  const maxColumn = grid[0].length - 1
  const destinations = ["D", "U", "L", "R"].flatMap((direction) =>
    _.range(4, 11).map((i) => `${maxRow}:${maxColumn}:${direction}:${i}`),
  )
  const paths = destinations.map((destination) => {
    const path = []
    let current = destination
    while (current !== undefined) {
      path.unshift(current)
      current = result.prev[current]
    }
    return path
  })
  const validPaths = paths.filter((path) => path[0] === start)
  const validPathsWithoutFirstElements = validPaths.map((p) => p.slice(1))

  const minPath = _.minBy(validPathsWithoutFirstElements, (path) =>
    _.sum(
      path.map((node) => {
        const [row, column] = node.split(":")
        return grid[parseInt(row)][parseInt(column)]
      }),
    ),
  )
  return _.sum(
    minPath.map((node) => {
      const [row, column] = node.split(":")
      return grid[parseInt(row)][parseInt(column)]
    }),
  )
}

run({
  part1: {
    tests: [
      {
        input: `
      2413432311323
      3215453535623
      3255245654254
      3446585845452
      4546657867536
      1438598798454
      4457876987766
      3637877979653
      4654967986887
      4564679986453
      1224686865563
      2546548887735
      4322674655533`,
        expected: 102,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `
      2413432311323
      3215453535623
      3255245654254
      3446585845452
      4546657867536
      1438598798454
      4457876987766
      3637877979653
      4654967986887
      4564679986453
      1224686865563
      2546548887735
      4322674655533`,
        expected: 94,
      },
      {
        input: `
111111111111
999999999991
999999999991
999999999991
999999999991`,
        expected: 71,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
})
