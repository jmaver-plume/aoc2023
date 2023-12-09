import run from "aocrunner"
import _ from "lodash"

function Report(numbers) {
  this.numbers = [numbers]
}

Report.prototype.getNextValue = function () {
  const numbers = _.cloneDeep(this.numbers)

  // Evaluate all differences
  while (!this.shouldStopEvaluatingDifferences(numbers)) {
    const lastNumbers = _.last(numbers)
    const differences = this.getDifferences(lastNumbers)
    numbers.push(differences)
  }

  // Calculate all LAST values
  _.last(numbers).push(0)
  for (let i = numbers.length - 2; i >= 0; i--) {
    const left = _.last(numbers[i])
    const bottom = _.last(numbers[i + 1])
    numbers[i].push(left + bottom)
  }

  // Return the first LAST value
  return _.last(_.first(numbers))
}

Report.prototype.shouldStopEvaluatingDifferences = function (numbers) {
  return _.last(numbers).every((n) => n === 0)
}

Report.prototype.getDifferences = function (numbers) {
  const differences = []
  for (let i = 1; i < numbers.length; i++) {
    differences.push(numbers[i] - numbers[i - 1])
  }
  return differences
}

const parseInput = (rawInput) =>
  rawInput
    .split("\n")
    .map((line) => new Report(line.split(" ").map((v) => parseInt(v))))

const part1 = (rawInput) => {
  const reports = parseInput(rawInput)
  return reports
    .map((report) => report.getNextValue())
    .reduce((sum, value) => sum + value, 0)
}

const part2 = (rawInput) => {
  const reports = parseInput(rawInput)
  reports.forEach((report) => _.reverse(_.first(report.numbers)))
  return reports
    .map((report) => report.getNextValue())
    .reduce((sum, value) => sum + value, 0)
}

run({
  part1: {
    tests: [
      {
        input: `0 3 6 9 12 15`,
        expected: 18,
      },
      {
        input: `0 3 6 9 12 15
1 3 6 10 15 21
10 13 16 21 30 45`,
        expected: 114,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `10 13 16 21 30 45`,
        expected: 5,
      },
      {
        input: `0 3 6 9 12 15
1 3 6 10 15 21
10 13 16 21 30 45`,
        expected: 2,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
})
