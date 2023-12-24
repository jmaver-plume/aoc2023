import run from "aocrunner"
import { getNextPositions, logGrid } from "../utils/index.js"
import _ from "lodash"

const parseInput = (rawInput) =>
  rawInput.split("\n").map((row) => {
    const [direction, rawDistance, rawColor] = row.split(" ")

    const distance = parseInt(rawDistance)
    const color = rawColor.replace(/[()]/g, "")
    return { direction, distance, color }
  })

const getCoordinates = (instructions) => {
  const coordinates = [{ x: 0, y: 0 }]
  instructions.forEach(({ direction, distance }) => {
    const last = _.last(coordinates)
    let next
    if (direction === "R") {
      next = { x: last.x + distance, y: last.y }
    } else if (direction === "L") {
      next = { x: last.x - distance, y: last.y }
    } else if (direction === "U") {
      next = { x: last.x, y: last.y - distance }
    } else if (direction === "D") {
      next = { x: last.x, y: last.y + distance }
    }
    coordinates.push(next)
  })

  return coordinates.map(({ x, y }) => ({ x: x + 1, y: y + 1 }))
}

const shoelace = (coordinates) => {
  let sum = 0
  for (let i = 0; i < coordinates.length - 1; i++) {
    const current = coordinates[i]
    const next = coordinates[i + 1]
    sum += next.x * current.y - current.x * next.y
  }
  return Math.abs(sum / 2)
}

const calculate = (instructions) => {
  const coordinates = getCoordinates(instructions)
  const area = shoelace(coordinates)
  const boundaryCount = instructions.reduce(
    (sum, instruction) => sum + instruction.distance,
    0,
  )
  // Pick's theorem
  const innerCount = area - boundaryCount / 2 + 1
  return boundaryCount + innerCount
}

const part1 = (rawInput) => {
  const instructions = parseInput(rawInput)
  return calculate(instructions)
}

const fixDirection = (direction) => {
  const map = {
    0: "R",
    1: "D",
    2: "L",
    3: "U",
  }
  return map[direction]
}

const fixInstruction = (instruction) => {
  const [rawDistance, rawDirection] = _.chunk(
    instruction.color.replace("#", "").split(""),
    5,
  ).map((v) => v.join(""))
  const distance = parseInt(rawDistance, 16)
  const direction = fixDirection(rawDirection)
  return { distance, direction }
}

const part2 = (rawInput) => {
  const instructions = parseInput(rawInput)
  const realInstructions = instructions.map((instruction) =>
    fixInstruction(instruction),
  )
  return calculate(realInstructions)
}

run({
  part1: {
    tests: [
      {
        input: `
R 6 (#70c710)
D 5 (#0dc571)
L 2 (#5713f0)
D 2 (#d2c081)
R 2 (#59c680)
D 2 (#411b91)
L 5 (#8ceee2)
U 2 (#caa173)
L 1 (#1b58a2)
U 2 (#caa171)
R 2 (#7807d2)
U 3 (#a77fa3)
L 2 (#015232)
U 2 (#7a21e3)
`,
        expected: 62,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `
R 6 (#70c710)
D 5 (#0dc571)
L 2 (#5713f0)
D 2 (#d2c081)
R 2 (#59c680)
D 2 (#411b91)
L 5 (#8ceee2)
U 2 (#caa173)
L 1 (#1b58a2)
U 2 (#caa171)
R 2 (#7807d2)
U 3 (#a77fa3)
L 2 (#015232)
U 2 (#7a21e3)`,
        expected: 952408144115,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
})
