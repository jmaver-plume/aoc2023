import run from "aocrunner"

const parseInput = (rawInput) => {
  const lines = rawInput.split("\n")
  return lines.map((line) => {
    const [rawCoordinate, rawVelocity] = line.split(" @ ")
    const coordinate = rawCoordinate.split(",").map((v) => parseInt(v))
    const velocity = rawVelocity.split(",").map((v) => parseInt(v))
    return {
      coordinate: new Coordinate(coordinate[0], coordinate[1], coordinate[2]),
      velocity: new Velocity(velocity[0], velocity[1], velocity[2]),
    }
  })
}

class Coordinate {
  constructor(x, y, z = null) {
    this.x = x
    this.y = y
    this.z = z
  }

  move({ x, y, z }) {
    return new Coordinate(this.x + x, this.y + y, this.z + z)
  }

  toString() {
    return `(${this.x}, ${this.y})`
  }
}

class Velocity {
  constructor(x, y, z = null) {
    this.x = x
    this.y = y
    this.z = z
  }
}

class Line2D {
  constructor(slope, intercept) {
    this.slope = slope
    this.intercept = intercept
  }

  static fromCoordinateAndVelocity(coordinate, velocity) {
    const slope = velocity.y / velocity.x
    const intercept = coordinate.y - slope * coordinate.x
    return new Line2D(slope, intercept)
  }

  toString() {
    return `f(x) = ${this.slope} * x + ${this.intercept}`
  }
}

const areLine2DParallel = (a, b) => {
  return a.slope === b.slope
}

const line2DIntersection = (a, b) => {
  if (areLine2DParallel(a, b)) {
    return null
  }

  const x = (b.intercept - a.intercept) / (a.slope - b.slope)
  const y = a.slope * x + a.intercept
  return new Coordinate(x, y)
}

const getRange = (coordinate, velocity) => {
  const range = { x: null, y: null }
  if (velocity.x > 0) {
    range.x = { min: coordinate.x, max: Infinity }
  } else if (velocity.x < 0) {
    range.x = { min: -Infinity, max: coordinate.x }
  } else {
    range.x = { min: coordinate.x, max: coordinate.x }
  }

  if (velocity.y > 0) {
    range.y = { min: coordinate.y, max: Infinity }
  } else if (velocity.y < 0) {
    range.y = { min: -Infinity, max: coordinate.y }
  } else {
    range.y = { min: coordinate.y, max: coordinate.y }
  }

  return range
}

const part1 = (rawInput) => {
  const input = parseInput(rawInput)
  const lines = input.map(({ coordinate, velocity }) =>
    Line2D.fromCoordinateAndVelocity(coordinate, velocity),
  )

  const min = 200000000000000
  const max = 400000000000000
  let count = 0
  for (let i = 0; i < lines.length; i++) {
    for (let j = i + 1; j < lines.length; j++) {
      const firstLine = lines[i]
      const secondLine = lines[j]
      const intersection = line2DIntersection(firstLine, secondLine)
      if (!intersection) {
        continue
      }

      const { x, y } = intersection
      const isInBounds = x >= min && x <= max && y >= min && y <= max
      if (!isInBounds) {
        continue
      }

      const firstRange = getRange(input[i].coordinate, input[i].velocity)
      const secondRange = getRange(input[j].coordinate, input[j].velocity)

      const isInPast =
        firstRange.x.min > x ||
        firstRange.x.max < x ||
        secondRange.x.min > x ||
        secondRange.x.max < x ||
        firstRange.y.min > y ||
        firstRange.y.max < y ||
        firstRange.y.min > y ||
        firstRange.y.max < y
      if (isInPast) {
        continue
      }

      count += 1
    }
  }

  return count
}

const part2 = (rawInput) => {
  const input = parseInput(rawInput)

  return
}

run({
  part1: {
    tests: [
      //       {
      //         input: `
      // 19, 13, 30 @ -2,  1, -2
      // 18, 19, 22 @ -1, -1, -2
      // 20, 25, 34 @ -2, -2, -4
      // 12, 31, 28 @ -1, -2, -1
      // 20, 19, 15 @  1, -5, -3`,
      //         expected: 2,
      //       },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      // {
      //   input: ``,
      //   expected: "",
      // },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
})
