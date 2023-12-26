import run from "aocrunner"
import _ from "lodash"
import { findCommonDenominator } from "../utils/index.js"

const Direction = {
  LEFT: "L",
  RIGHT: "R",
}

const FINAL_NODE = "ZZZ"

const parseInput = (rawInput) => {
  const [rawDirections, rawNodes] = rawInput.split("\n\n")
  const directions = rawDirections.trim().split("")
  const regex = /\b[0-9A-Z]{3}\b/g
  const graph = {}
  rawNodes
    .split("\n")
    .map((node) => node.trim().match(regex))
    .forEach((nodes) => {
      if (nodes[0] in graph) {
        throw new Error(`Duplicate node ${nodes[0]} found!`)
      }

      graph[nodes[0]] = {
        [Direction.LEFT]: nodes[1],
        [Direction.RIGHT]: nodes[2],
      }
    })
  return { directions, graph }
}

const part1 = (rawInput) => {
  const { directions, graph } = parseInput(rawInput)
  let currentNode = "AAA"
  let steps = 0
  while (currentNode !== FINAL_NODE) {
    directions.forEach((direction) => {
      currentNode = graph[currentNode][direction]
      steps++
    })
  }

  return steps
}

const part2 = (rawInput) => {
  const getStartingNodes = (graph) =>
    _.keys(graph).filter((key) => key.endsWith("A"))

  const findCycle = (graph, startNode, directions) => {
    const findCycleInActions = (actions) => {
      const visited = new Map()
      for (let i = 0; i < actions.length; i++) {
        if (visited.has(actions[i])) {
          const firstIndex = actions.findIndex((item) => item === actions[i])
          return actions.slice(firstIndex, i)
        }

        visited.set(actions[i], i)
      }

      return null
    }

    const actions = []
    let currentNode = startNode
    let cycle = null
    while ((cycle = findCycleInActions(actions)) === null) {
      for (let i = 0; i < directions.length; i++) {
        currentNode = graph[currentNode][directions[i]]
        actions.push(`${currentNode}:${directions[i]}:${i}`)
      }
    }

    return cycle
  }

  const { directions, graph } = parseInput(rawInput)
  const startingNodes = getStartingNodes(graph)
  const cycles = startingNodes.map((node) => findCycle(graph, node, directions))
  return findCommonDenominator(cycles.map((cycle) => cycle.length))
}

run({
  part1: {
    tests: [
      {
        input: `RL

AAA = (BBB, CCC)
BBB = (DDD, EEE)
CCC = (ZZZ, GGG)
DDD = (DDD, DDD)
EEE = (EEE, EEE)
GGG = (GGG, GGG)
ZZZ = (ZZZ, ZZZ)`,
        expected: 2,
      },
      {
        input: `LLR

AAA = (BBB, BBB)
BBB = (AAA, ZZZ)
ZZZ = (ZZZ, ZZZ)`,
        expected: 6,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `LR

11A = (11B, XXX)
11B = (XXX, 11Z)
11Z = (11B, XXX)
22A = (22B, XXX)
22B = (22C, 22C)
22C = (22Z, 22Z)
22Z = (22B, 22B)
XXX = (XXX, XXX)`,
        expected: 6,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
})
