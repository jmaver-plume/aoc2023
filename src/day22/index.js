import run from "aocrunner"
import _ from "lodash"
import assert from "node:assert"

const EMPTY = "."

class Position2D {
  constructor(x, y) {
    this.x = x
    this.y = y
  }

  toString() {
    return `(${this.x},${this.y})`
  }
}

class Position3D {
  constructor(x, y, z) {
    this.x = x
    this.y = y
    this.z = z
  }

  move(x, y, z) {
    this.x += x
    this.y += z
    this.z += z
  }
}

class Brick {
  constructor(id, start, end) {
    this.id = id
    this.start = start
    this.end = end
  }

  getPositions() {
    const positions = []
    for (let x = this.start.x; x <= this.end.x; x++) {
      for (let y = this.start.y; y <= this.end.y; y++) {
        for (let z = this.start.z; z <= this.end.z; z++) {
          positions.push(new Position3D(x, y, z))
        }
      }
    }
    return positions
  }

  getPlane() {
    const plane = []
    for (let x = this.start.x; x <= this.end.x; x++) {
      for (let y = this.start.y; y <= this.end.y; y++) {
        plane.push(new Position2D(x, y))
      }
    }
    return plane
  }

  fallTo(z) {
    // Assert we do not "fall" up.
    const distance = this.start.z - z
    assert.ok(distance >= 0, `this.start.z = ${this.start.z}, z = ${z}`)
    this.start.z = z
    this.end.z -= distance
  }
}

const getMaxX = (bricks) =>
  _.max(bricks.flatMap((brick) => [brick.start.x, brick.end.x]))

const getMaxY = (bricks) =>
  _.max(bricks.flatMap((brick) => [brick.start.y, brick.end.y]))

const getMaxZ = (bricks) =>
  _.max(bricks.flatMap((brick) => [brick.start.z, brick.end.z]))

const getMinZ = (bricks) =>
  _.min(bricks.flatMap((brick) => [brick.start.z, brick.end.z]))

const parseInput = (rawInput) =>
  rawInput.split("\n").map((line, i) => {
    const [startRaw, endRaw] = line.split("~")
    const id = String.fromCharCode(i + 65)
    const start = new Position3D(...startRaw.split(",").map((v) => parseInt(v)))
    const end = new Position3D(...endRaw.split(",").map((v) => parseInt(v)))
    return new Brick(id, start, end)
  })

const assertInput = (bricks) => {
  // Assert minZ is not equal to 0 and 1 both being the ground.
  const minZ = getMinZ(bricks)
  assert.notEqual(minZ, 0)

  // Assert start is always before the end, so we don't have don't have to worry about orientation.
  const startIsLessThanEnd = bricks.every(
    (brick) =>
      brick.start.x <= brick.end.x &&
      brick.start.y <= brick.end.y &&
      brick.start.z <= brick.end.z,
  )
  assert.ok(startIsLessThanEnd)
}

class Heights {
  constructor(maxX, maxY) {
    this.map = {}
    for (let y = 0; y <= maxY; y++) {
      for (let x = 0; x <= maxX; x++) {
        const position = new Position2D(x, y)
        const key = position.toString()
        this.map[key] = 0
      }
    }
  }

  getHeight(plane) {
    return _.max(plane.map((position) => this.map[position.toString()]))
  }

  setHeight(plane, height) {
    plane.forEach((position) => {
      const key = position.toString()
      this.map[key] = height
    })
  }
}

class Space {
  constructor(maxX, maxY, maxZ) {
    this.maxX = maxX
    this.maxY = maxY
    this.maxZ = maxZ

    this.space = []
    for (let z = 0; z <= maxZ; z++) {
      const plane = []
      for (let y = 0; y <= maxY; y++) {
        const row = []
        for (let x = 0; x <= maxX; x++) {
          row.push(EMPTY)
        }
        plane.push(row)
      }
      this.space.push(plane)
    }
  }

  getValue(position) {
    const { x, y, z } = position
    return this.space[z][y][x]
  }

  setValue(position, value) {
    // Assert that "falling" works correctly by checking that the same position is not occupied more than once.
    const oldValue = this.getValue(position)
    assert.equal(oldValue, EMPTY)

    const { x, y, z } = position
    this.space[z][y][x] = value
  }

  logXZ() {
    const rows = []
    for (let z = 0; z <= this.maxZ; z++) {
      const row = []
      for (let x = 0; x <= this.maxX; x++) {
        let brick = EMPTY
        for (let y = 0; y <= this.maxY; y++) {
          const value = this.getValue(new Position3D(x, y, z))
          if (value !== EMPTY) {
            brick = value
            break
          }
        }
        row.push(brick)
      }
      rows.unshift(row)
    }

    console.log(rows.join("\n") + "\n")
  }

  logYZ() {
    const rows = []
    for (let z = 0; z <= this.maxZ; z++) {
      const row = []
      for (let y = 0; y <= this.maxY; y++) {
        let brick = EMPTY
        for (let x = 0; x <= this.maxX; x++) {
          const value = this.getValue(new Position3D(x, y, z))
          if (value !== EMPTY) {
            brick = value
            break
          }
        }
        row.push(brick)
      }
      rows.unshift(row)
    }

    console.log(rows.join("\n") + "\n")
  }

  static fromBricks(bricks) {
    const maxX = getMaxX(bricks)
    const maxY = getMaxY(bricks)
    const maxZ = getMaxZ(bricks)
    const space = new Space(maxX, maxY, maxZ)

    bricks.forEach((brick) => {
      const positions = brick.getPositions()
      positions.forEach((position) => space.setValue(position, brick.id))
    })

    return space
  }
}

const fall = (bricks) => {
  const maxX = getMaxX(bricks)
  const maxY = getMaxY(bricks)

  const heights = new Heights(maxX, maxY)

  // Sort bricks by height
  // Without sorting we could first process brick at z position (100) instead of z (10)
  bricks.sort((a, b) => a.start.z - b.start.z)

  bricks.forEach((brick) => {
    const plane = brick.getPlane()
    const newBottomHeight = heights.getHeight(plane)
    brick.fallTo(newBottomHeight)
    heights.setHeight(plane, brick.end.z + 1)
  })
}

const getBrickToCarriedBricksMap = (brick, space) => {
  const plane = brick.getPlane()
  const topZ = brick.end.z
  const positions = plane
    .map((position) => new Position3D(position.x, position.y, topZ + 1))
    .filter((position) => position.z <= space.maxZ)

  const carriedBricks = new Set()
  positions.forEach((position) => {
    const value = space.getValue(position)
    if (value === EMPTY) {
      return
    }
    carriedBricks.add(value)
  })
  return Array.from(carriedBricks)
}

const getBrickToCarrierBricksMap = (brick, space) => {
  const plane = brick.getPlane()
  const bottomZ = brick.start.z
  const positions = plane
    .map((position) => new Position3D(position.x, position.y, bottomZ - 1))
    .filter((position) => position.z >= 0)

  const carrierBricks = new Set()
  positions.forEach((position) => {
    const value = space.getValue(position)
    if (value === EMPTY) {
      return
    }
    carrierBricks.add(value)
  })
  return Array.from(carrierBricks)
}

const canDisintegrateBrick = (
  brick,
  brickToCarriedBricksMap,
  brickToCarrierBricksMap,
) => {
  const carriedBricks = brickToCarriedBricksMap[brick.id]
  const carriedBricksCarrierBricks = Array.from(carriedBricks).map(
    (id) => brickToCarrierBricksMap[id],
  )
  const carriedBrickCarrierCounts = carriedBricksCarrierBricks.map(
    (bricks) => bricks.length,
  )
  return carriedBrickCarrierCounts.every((count) => count !== 1)
}

const part1 = (rawInput) => {
  const bricks = parseInput(rawInput)
  assertInput(bricks)

  fall(bricks)

  const space = Space.fromBricks(bricks)
  const brickToCarriedBricksMap = bricks
    .map((brick) => ({ [brick.id]: getBrickToCarriedBricksMap(brick, space) }))
    .reduce((map, partial) => Object.assign(map, partial), {})
  const brickToCarrierBricksMap = bricks
    .map((brick) => ({ [brick.id]: getBrickToCarrierBricksMap(brick, space) }))
    .reduce((map, partial) => Object.assign(map, partial), {})

  const bricksThatCanBeDisintegrated = bricks.filter((brick) =>
    canDisintegrateBrick(
      brick,
      brickToCarriedBricksMap,
      brickToCarrierBricksMap,
    ),
  )
  return bricksThatCanBeDisintegrated.length
}

const evaluateCounts = (
  brick,
  brickToCarriedBricksMap,
  brickToCarrierBricksMap,
  cache,
) => {
  if (brick in cache) {
    return cache[brick]
  }

  const set = new Set()
  brickToCarriedBricksMap[brick].forEach((brick) => {
    const bricks = evaluateCounts(
      brick,
      brickToCarriedBricksMap,
      brickToCarrierBricksMap,
      cache,
    )
    bricks.forEach((brick) => {
      set.add(brick)
    })
    set.add(brick)
  })

  cache[brick] = Array.from(set)
  return cache[brick]
}

const part2 = (rawInput) => {
  const bricks = parseInput(rawInput)
  assertInput(bricks)

  fall(bricks)

  const space = Space.fromBricks(bricks)
  const brickToCarriedBricksMap = bricks
    .map((brick) => ({ [brick.id]: getBrickToCarriedBricksMap(brick, space) }))
    .reduce((map, partial) => Object.assign(map, partial), {})
  const brickToCarrierBricksMap = bricks
    .map((brick) => ({ [brick.id]: getBrickToCarrierBricksMap(brick, space) }))
    .reduce((map, partial) => Object.assign(map, partial), {})

  const bricksThatCannotBeDisintegrated = bricks.filter(
    (brick) =>
      !canDisintegrateBrick(
        brick,
        brickToCarriedBricksMap,
        brickToCarrierBricksMap,
      ),
  )

  const bricksMap = _.keyBy(bricks, (brick) => brick.id)

  const bricksThatCanPotentiallyFall = _.entries(brickToCarrierBricksMap)
    .filter((entry) => entry[1].length !== 0)
    .map((entry) => bricksMap[entry[0]])

  console.log(
    "bricksThatCannotBeDisintegrated count: ",
    bricksThatCannotBeDisintegrated.length,
  )
  const sizes = bricksThatCannotBeDisintegrated.map((brick, i) => {
    const set = new Set([brick.id])
    while (true) {
      const list = Array.from(set)
      const bricksThatWouldFall = bricksThatCanPotentiallyFall.filter(
        (brick) => {
          const carriers = brickToCarrierBricksMap[brick.id]
          const realCarriers = _.difference(carriers, list)
          return realCarriers.length === 0
        },
      )
      const oldSetSize = set.size
      bricksThatWouldFall.forEach((brick) => {
        set.add(brick.id)
      })
      const newSetSize = set.size
      if (oldSetSize === newSetSize) {
        break
      }
    }

    console.log(
      `Finished brick ${brick.id} at iteration ${i + 1} with size ${set.size}.`,
    )
    return set.size
  })

  // for each brick that cannot be disintegrated
  //   initialize set with brick
  //   while true
  //    find all top bricks that will fall without any of the bricks in the set
  //    if these bricks are same as the set break
  //    add this bricks to set
  //   return set.size

  return _.sum(sizes.map((size) => size - 1))
}

run({
  part1: {
    tests: [
      {
        input: `
1,0,1~1,2,1
0,0,2~2,0,2
0,2,3~2,2,3
0,0,4~0,2,4
2,0,5~2,2,5
0,1,6~2,1,6
1,1,8~1,1,9`,
        expected: 5,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `
1,0,1~1,2,1
0,0,2~2,0,2
0,2,3~2,2,3
0,0,4~0,2,4
2,0,5~2,2,5
0,1,6~2,1,6
1,1,8~1,1,9`,
        expected: 7,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
})
