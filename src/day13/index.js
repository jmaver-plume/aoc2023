import run from "aocrunner"
import _ from "lodash"

const parseInput = (rawInput) =>
  rawInput
    .split("\n\n")
    .map((rawGrid) => rawGrid.split("\n").map((line) => line.split("")))

const getCommonPairs = (grid) => {
  const getPairs = (row) => {
    const pairs = []
    for (let i = 1; i < row.length; i++) {
      if (row[i - 1] === row[i]) {
        pairs.push([i - 1, i])
      }
    }
    return pairs
  }

  const allPairs = grid.map((row) => getPairs(row))
  return _.intersectionBy(...allPairs, (v) => v.toString())
}

const isMirrorRow = (row, pair) => {
  let [left, right] = pair
  while (left >= 0 && right <= row.length - 1) {
    if (row[left] !== row[right]) {
      return false
    }

    left -= 1
    right += 1
  }

  return true
}

const getReflections = (grid) => {
  const reflections = []

  const commonColumnPairs = getCommonPairs(grid)
  const mirroredColumnPairs = commonColumnPairs.filter((pair) =>
    grid.every((row) => isMirrorRow(row, pair)),
  )
  reflections.push(
    ...mirroredColumnPairs.map((pair) => ({ type: "vertical", pair })),
  )

  const zipped = _.zip(...grid)
  const commonRowPairs = getCommonPairs(zipped)
  const mirroredRowPairs = commonRowPairs.filter((pair) =>
    zipped.every((row) => isMirrorRow(row, pair)),
  )
  reflections.push(
    ...mirroredRowPairs.map((pair) => ({ type: "horizontal", pair })),
  )

  return reflections
}

const getReflectionValue = ({ pair, type }) =>
  type === "horizontal" ? (pair[0] + 1) * 100 : pair[0] + 1

const part1 = (rawInput) => {
  const grids = parseInput(rawInput)
  return grids
    .map((grid) => getReflections(grid))
    .map((reflections) => _.first(reflections))
    .map((reflection) => getReflectionValue(reflection))
    .reduce((sum, value) => sum + value, 0)
}

const areReflectionsEquals = (a, b) =>
  a.type === b.type && a.pair.toString() === b.pair.toString()

const getInverse = (value) => (value === "#" ? "." : "#")

const findSmudgeReflection = (grid, oldReflection) => {
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[0].length; j++) {
      const oldValue = grid[i][j]
      grid[i][j] = getInverse(oldValue)

      const smudgeReflection = getReflections(grid).find(
        (candidate) => !areReflectionsEquals(candidate, oldReflection),
      )

      // Reset back to original grid value
      grid[i][j] = oldValue

      if (smudgeReflection) {
        return smudgeReflection
      }
    }
  }
}

const part2 = (rawInput) => {
  const grids = parseInput(rawInput)
  return grids
    .map((grid) => findSmudgeReflection(grid, _.first(getReflections(grid))))
    .map((reflection) => getReflectionValue(reflection))
    .reduce((sum, value) => sum + value, 0)
}

run({
  part1: {
    tests: [
      {
        input: `
#.##..##.
..#.##.#.
##......#
##......#
..#.##.#.
..##..##.
#.#.##.#.

#...##..#
#....#..#
..##..###
#####.##.
#####.##.
..##..###
#....#..#`,
        expected: 405,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `
#.##..##.
..#.##.#.
##......#
##......#
..#.##.#.
..##..##.
#.#.##.#.

#...##..#
#....#..#
..##..###
#####.##.
#####.##.
..##..###
#....#..#`,
        expected: 400,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
})
