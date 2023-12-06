import run from "aocrunner"

const parseInput = (rawInput) => rawInput

function Race(duration, record) {
  this.duration = duration
  this.record = record
}

Race.prototype.getDistance = function (chargeDuration) {
  const speed = chargeDuration
  const remainingTime = this.duration - chargeDuration
  return Math.max(0, speed * remainingTime)
}

Race.prototype.getMinimumWinningChargeDuration = function () {
  let minimum = -1
  let left = 0
  let right = this.duration
  while (left <= right) {
    const middle = Math.floor((left + right) / 2)
    const distance = this.getDistance(middle)
    if (distance > this.record) {
      minimum = middle
      right = middle - 1
    } else {
      left = middle + 1
    }
  }

  return minimum
}

Race.prototype.getMaximumWinningChargeDuration = function () {
  let maximum = -1
  let left = 0
  let right = this.duration
  while (left <= right) {
    const middle = Math.floor((left + right) / 2)
    const distance = this.getDistance(middle)
    if (distance > this.record) {
      maximum = middle
      left = middle + 1
    } else {
      right = middle - 1
    }
  }

  return maximum
}

Race.prototype.getCountOfWinningChargeDurations = function () {
  const minimum = this.getMinimumWinningChargeDuration()
  const maximum = this.getMaximumWinningChargeDuration()
  return maximum - minimum + 1
}

const part1 = (rawInput) => {
  const input = parseInput(rawInput)
  const lines = input.split("\n")

  const times = lines[0]
    .split(":")[1]
    .trim()
    .split(/\s+/)
    .map((v) => parseInt(v))

  const distances = lines[1]
    .split(":")[1]
    .trim()
    .split(/\s+/)
    .map((v) => parseInt(v))

  const races = times.map((_, i) => new Race(times[i], distances[i]))

  return races
    .map((race) => race.getCountOfWinningChargeDurations())
    .reduce((product, count) => product * count, 1)
}

const part2 = (rawInput) => {
  const input = parseInput(rawInput)
  const lines = input.split("\n")
  const time = parseInt(lines[0].split(":")[1].trim().split(/\s+/).join(""))
  const distance = parseInt(lines[1].split(":")[1].trim().split(/\s+/).join(""))

  const race = new Race(time, distance)
  return race.getCountOfWinningChargeDurations()
}

run({
  part1: {
    tests: [
      {
        input: `Time:      7  15   30
Distance:  9  40  200`,
        expected: 288,
      },
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
