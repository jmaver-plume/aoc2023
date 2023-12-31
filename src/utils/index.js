/**
 * Root for your util libraries.
 *
 * You can import them in the src/template/index.js,
 * or in the specific file.
 *
 * Note that this repo uses ES Modules, so you have to explicitly specify
 * .js extension (yes, .js not .ts - even for TypeScript files)
 * for imports that are not imported from node_modules.
 *
 * For example:
 *
 *   correct:
 *
 *     import _ fro 'lodash
 *     import myLib from '../utils/myLib.js'
 *     import { myUtil } from '../utils/index.js'
 *
 *   incorrect:
 *
 *     import _ fro 'lodash
 *     import myLib from '../utils/myLib'
 *     import { myUtil } from '../utils'
 */
import _ from "lodash"
import fs from "fs"
import { exec } from "child_process"

export const getNextPositions = (
  grid,
  position,
  includeDiagonals = false,
  predicate = (position, value) => true,
) => {
  const nextPositions = []
  const { row, column } = position
  const maxRow = grid.length
  const maxCol = grid[0].length

  // Up
  if (row > 0) {
    nextPositions.push({ row: row - 1, column: column, direction: "U" })
  }
  // Down
  if (row < maxRow - 1) {
    nextPositions.push({ row: row + 1, column: column, direction: "D" })
  }
  // Left
  if (column > 0) {
    nextPositions.push({ row, column: column - 1, direction: "L" })
  }
  // Right
  if (column < maxCol - 1) {
    nextPositions.push({ row, column: column + 1, direction: "R" })
  }

  // Diagonals
  if (includeDiagonals) {
    // Upper Left
    if (row > 0 && column > 0) {
      nextPositions.push({ row: row - 1, column: column - 1, direction: "UL" })
    }
    // Upper Right
    if (row > 0 && column < maxCol - 1) {
      nextPositions.push({ row: row - 1, column: column + 1, direction: "UR" })
    }
    // Lower Left
    if (row < maxRow - 1 && column > 0) {
      nextPositions.push({ row: row + 1, column: column - 1, direction: "DL" })
    }
    // Lower Right
    if (row < maxRow - 1 && column < maxCol - 1) {
      nextPositions.push({ row: row + 1, column: column + 1, direction: "DR" })
    }
  }

  return nextPositions.filter((p) => predicate(p, grid[p.row][p.column]))
}

export const uniqPositions = (positions) =>
  _.uniqBy(positions, ({ row, column }) => `${row}:${column}`)

export const gridIterator = function* (grid) {
  for (let row = 0; row < grid.length; row++) {
    for (let column = 0; column < grid[0].length; column++) {
      yield { row, column, value: grid[row][column] }
    }
  }
}

export const logGrid = (grid) => {
  console.log(grid.map((row) => row.join("")).join("\n") + "\n")
}

export const parseGrid = (input) =>
  input.split("\n").map((line) => line.split(""))

export const mermaid = (graph, directions = true) => {
  const edges = _.entries(graph).flatMap(([key, neighbours]) => {
    return neighbours.map((neighbour) => {
      if (directions) {
        return `    ${key} --> ${neighbour}`
      } else {
        if (key > neighbour) {
          return `    ${key} --- ${neighbour}`
        } else {
          return `    ${neighbour} --- ${key}`
        }
      }
    })
  })
  return "graph\n" + _.uniq(edges).join("\n")
}

export const createGraphFromPaths = (paths) => {
  const graph = { A: new Set() }
  paths.forEach((path) => {
    for (let i = 0; i < path.length - 1; i++) {
      if (path[i] in graph) {
        graph[path[i]].add(path[i + 1])
      } else {
        graph[path[i]] = new Set([path[i + 1]])
      }
    }
  })
  return _.fromPairs(
    _.entries(graph).map((entry) => {
      return [entry[0], Array.from(entry[1])]
    }),
  )
}

export const findCommonDenominator = (numbers) => {
  const gcd = (a, b) => {
    while (b !== 0) {
      let t = b
      b = a % b
      a = t
    }
    return a
  }

  const lcm = (a, b) => {
    return Math.abs(a * b) / gcd(a, b)
  }

  let result = numbers[0]
  for (let i = 1; i < numbers.length; i++) {
    result = lcm(result, numbers[i])
  }
  return result
}

export class Graphviz {
  constructor(graph) {
    this.graph = graph
  }

  build() {
    const edges = this.graph
      .getEdges()
      .map(
        (edge) =>
          `"${edge.src}" -- "${edge.dest}" [label=${this.graph.getWeight(
            edge,
          )}]`,
      )
      .map((edge) => "    " + edge)
      .join("\n")

    return "strict graph G {\n" + edges + "\n}"

    // if (this.type === "digraph") {
    //   const edges = this.graph.edges
    //     .map((edge) => `"${edge.src}" -> "${edge.dest}"`)
    //     .map((edge) => "    " + edge)
    //     .join("\n")
    //
    //   return "digraph G {\n" + edges + "\n}"
    // }
  }

  write(name, type) {
    const graph = this.build()
    fs.writeFileSync(`/tmp/${name}.dot`, graph)
    exec(
      `dot -T ${type} -o /tmp/${name}.${type} /tmp/${name}.dot`,
      (error, stdout, stderr) => {
        if (error) {
          console.log(`error: ${error.message}`)
        } else if (stderr) {
          console.log(`stderr: ${stderr}`)
        } else {
          console.log(`Graph was written to /tmp/${name}.${type}!`)
        }
      },
    )
  }
}

export class Edge {
  constructor(src, dest, weight = 1) {
    this.src = src
    this.dest = dest
    this.weight = weight
  }

  toString() {
    return `${this.src}:${this.dest}`
  }

  static fromString(string) {
    const [src, dest] = string.split(":")
    return new Edge(src, dest)
  }
}

export class Graph {
  constructor() {
    this.nodes = {}
    this.weights = {}
  }

  addNode(node) {
    this.nodes[node] = new Set()
  }

  addEdge(edge) {
    this.nodes[edge.src].add(edge.dest)
    this.nodes[edge.dest].add(edge.src)

    this.weights[new Edge(edge.src, edge.dest).toString()] = edge.weight
    this.weights[new Edge(edge.dest, edge.src).toString()] = edge.weight
  }

  removeEdge(edge) {
    this.nodes[edge.src].delete(edge.dest)
    this.nodes[edge.dest].delete(edge.src)

    delete this.weights[new Edge(edge.src, edge.dest).toString()]
    delete this.weights[new Edge(edge.dest, edge.src).toString()]
  }

  removeNode(node) {
    const edges = this.getNodeEdges(node)
    edges.forEach((edge) => {
      this.removeEdge(new Edge(edge.dest, edge.src))
    })
    delete this.nodes[node]
  }

  getEdges() {
    return _.keys(this.nodes).flatMap((node) => this.getNodeEdges(node))
  }

  getNodeEdges(node) {
    return Array.from(this.nodes[node]).map((dest) => new Edge(node, dest))
  }

  getWeight(edge) {
    return this.weights[edge.toString()]
  }
}

export function heapSort(heap) {
  const result = []
  while (!heap.isEmpty()) {
    result.push(heap.extract())
  }
  return result
}
