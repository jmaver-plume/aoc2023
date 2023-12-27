import run from "aocrunner"
import {
  Edge,
  getNextPositions,
  Graph,
  Graphviz,
  gridIterator,
  logGrid,
  parseGrid,
} from "../utils/index.js"
import _ from "lodash"

class Position {
  constructor(row, column) {
    this.row = row
    this.column = column
  }

  toString() {
    return `${this.row}:${this.column}`
  }

  static fromString(string) {
    const [row, column] = string.split(":")
    return new Position(parseInt(row), parseInt(column))
  }
}

export const createGraphFromGrid = (grid) => {
  const nodePositions = []
  for (const { row, column, value } of gridIterator(grid)) {
    if (value !== "#") {
      nodePositions.push(new Position(row, column))
    }
  }

  const edges = nodePositions.flatMap((vertice) =>
    getNextPositions(grid, vertice, false, (_, value) => value !== "#")
      .filter((next) => {
        const value = grid[vertice.row][vertice.column]
        if (value === ">") {
          return next.row === vertice.row && next.column === vertice.column + 1
        }

        if (value === "<") {
          return next.row === vertice.row && next.column === vertice.column - 1
        }

        if (value === "^") {
          return next.row === vertice.row - 1 && next.column === vertice.column
        }

        if (value === "v") {
          return next.row === vertice.row + 1 && next.column === vertice.column
        }

        return true
      })
      .map((p) => new Position(p.row, p.column))
      .map((next) => new Edge(vertice.toString(), next.toString())),
  )

  const graph = new Graph()
  nodePositions.forEach((p) => graph.addNode(p.toString()))
  edges.forEach((edge) => graph.addEdge(edge))

  return graph
}

const parseInput = (rawInput) => parseGrid(rawInput)

const part1 = (rawInput) => {
  const backtrackGrid = (position, grid, path) => {
    const results = []

    const stack = [{ position, path }]
    while (stack.length) {
      const { position, path } = stack.pop()
      const clonedPath = _.clone(path)

      if (position.row === grid.length - 1) {
        results.push(clonedPath)
        continue
      }

      const string = position.toString()
      clonedPath.push(string)

      const value = grid[position.row][position.column]
      const nextPositions = getNextPositions(
        grid,
        position,
        false,
        (_, value) => value !== "#",
      )
        .filter((next) => {
          if (value === ">") {
            return (
              next.row === position.row && next.column === position.column + 1
            )
          }

          if (value === "<") {
            return (
              next.row === position.row && next.column === position.column - 1
            )
          }

          if (value === "^") {
            return (
              next.row === position.row - 1 && next.column === position.column
            )
          }

          if (value === "v") {
            return (
              next.row === position.row + 1 && next.column === position.column
            )
          }

          return true
        })
        .map((p) => new Position(p.row, p.column, p.direction))
        .filter((p) => !clonedPath.includes(p.toString()))

      nextPositions.forEach((nextPosition) => {
        stack.push({ position: nextPosition, path: clonedPath })
      })
    }

    return results
  }

  const grid = parseInput(rawInput)

  const start = new Position(
    0,
    grid[0].findIndex((v) => v === "."),
    "D",
  )
  const paths = backtrackGrid(start, grid, [])
  return _.max(paths.map((p) => p.length))
}

// Algorithm:
//  Brute force does not finish on a full graph so we need to "contract" it.
//  "Contract" or "merge" all nodes where edge count of a node is 2 (a -1- b -1- c) => (a -2- c).
//  I used graphviz on test output to review graph before and after contraction.
//  Contraction reduces number of nodes.
//  Run backtracking brute force algorithm to return all paths
//  For each path calculate path distance by calculating edge weights
//  Return maximum path
const part2 = (rawInput) => {
  const backtrack = (graph, start, end, path) => {
    const results = []

    const stack = [{ current: start, path }]
    while (stack.length) {
      const { current, path } = stack.pop()
      const clonedPath = _.clone(path)

      clonedPath.push(current)
      if (current === end) {
        results.push(clonedPath)
        continue
      }

      const next = graph
        .getNodeEdges(current)
        .map((edge) => edge.dest)
        .filter((next) => !clonedPath.includes(next))
      next.forEach((edge) => {
        stack.push({ current: edge, path: clonedPath })
      })
    }

    return results
  }

  const contract = (graph) => {
    let node = _.entries(graph.nodes).find((entry) => entry[1].size === 2)[0]
    while (node) {
      const [first, last] = graph.getNodeEdges(node)

      const firstWeight = graph.getWeight(first)
      const lastWeight = graph.getWeight(last)
      const newWeight = firstWeight + lastWeight

      // Remove node
      graph.removeNode(node)

      // Add new edges
      graph.addEdge(new Edge(first.dest, last.dest, newWeight))
      graph.addEdge(new Edge(last.dest, first.dest, newWeight))

      const candidate = _.entries(graph.nodes).find(
        (entry) => entry[1].size === 2,
      )
      if (candidate) {
        node = candidate[0]
      } else {
        node = undefined
      }
    }
  }

  const grid = parseInput(rawInput)

  // Convert all arrows to '.'
  for (const { row, column, value } of gridIterator(grid)) {
    if (value !== "#") {
      grid[row][column] = "."
    }
  }

  const graph = createGraphFromGrid(grid)
  contract(graph)

  // Get start and end nodes
  const start = _.keys(graph.nodes).find((key) => key.split(":")[0] === "0")
  const end = _.keys(graph.nodes).find(
    (key) => parseInt(key.split(":")[0]) === grid.length - 1,
  )

  // Get all paths from start to end
  const paths = backtrack(graph, start, end, [])

  // Convert paths to edges
  // [a,b,c] -> [{ src:a, dest: b }, { src: b, dest: c}]
  const pathEdges = paths.map((path) => {
    const edges = []
    for (let i = 1; i < path.length; i++) {
      edges.push(new Edge(path[i - 1], path[i]))
    }
    return edges
  })

  // For each path count the edge weights
  const counts = pathEdges.map((edges) =>
    _.sum(edges.map((edge) => graph.getWeight(edge))),
  )

  // Return path with the largest sum of weights
  return _.max(counts)
}

run({
  part1: {
    tests: [
      {
        input: `
      #.#####################
      #.......#########...###
      #######.#########.#.###
      ###.....#.>.>.###.#.###
      ###v#####.#v#.###.#.###
      ###.>...#.#.#.....#...#
      ###v###.#.#.#########.#
      ###...#.#.#.......#...#
      #####.#.#.#######.#.###
      #.....#.#.#.......#...#
      #.#####.#.#.#########v#
      #.#...#...#...###...>.#
      #.#.#v#######v###.###v#
      #...#.>.#...>.>.#.###.#
      #####v#.#.###v#.#.###.#
      #.....#...#...#.#.#...#
      #.#########.###.#.#.###
      #...###...#...#...#.###
      ###.###.#.###v#####v###
      #...#...#.#.>.>.#.>.###
      #.###.###.#.###.#.#v###
      #.....###...###...#...#
      #####################.#`,
        expected: 94,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `
      #.#####################
      #.......#########...###
      #######.#########.#.###
      ###.....#.>.>.###.#.###
      ###v#####.#v#.###.#.###
      ###.>...#.#.#.....#...#
      ###v###.#.#.#########.#
      ###...#.#.#.......#...#
      #####.#.#.#######.#.###
      #.....#.#.#.......#...#
      #.#####.#.#.#########v#
      #.#...#...#...###...>.#
      #.#.#v#######v###.###v#
      #...#.>.#...>.>.#.###.#
      #####v#.#.###v#.#.###.#
      #.....#...#...#.#.#...#
      #.#########.###.#.#.###
      #...###...#...#...#.###
      ###.###.#.###v#####v###
      #...#...#.#.>.>.#.>.###
      #.###.###.#.###.#.#v###
      #.....###...###...#...#
      #####################.#`,
        expected: 154,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
})
