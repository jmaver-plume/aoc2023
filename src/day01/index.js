import run from "aocrunner"

const parseInput = (rawInput) => rawInput

const parseWordNumbers = (str) => {
  const map = {
    one: "1e",
    two: "2o",
    three: "3e",
    four: "4r",
    five: "5e",
    six: "6x",
    seven: "7n",
    eight: "8t",
    nine: "9e",
  }

  return str
    .replaceAll(
      /(one|two|three|four|five|six|seven|eight|nine)/g,
      (word) => map[word],
    )
    .replaceAll(
      /(one|two|three|four|five|six|seven|eight|nine)/g,
      (word) => map[word],
    )
}

const extractNumbers = (str) => (str.match(/\d+/g) || []).join("")

const extractCalibrationValue = (str) =>
  parseInt(`${str[0]}${str[str.length - 1]}`)

const sum = (numbers) => numbers.reduce((sum, number) => number + sum, 0)

const part1 = (rawInput) => {
  const input = parseInput(rawInput)
  const lines = input.split("\n")
  const calibrationValues = lines
    .map((line) => extractNumbers(line))
    .map((line) => extractCalibrationValue(line))
  return sum(calibrationValues)
}

const part2 = (rawInput) => {
  const input = parseInput(rawInput)
  const lines = input.split("\n")
  const calibrationValues = lines
    .map((line) => parseWordNumbers(line))
    .map((line) => extractNumbers(line))
    .map((line) => extractCalibrationValue(line))
  return sum(calibrationValues)
}

run({
  part1: {
    tests: [
      // {
      //   input: ``,
      //   expected: "",
      // },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `two1nine
      eightwothree
      abcone2threexyz
      xtwone3four
      4nineeightseven2
      zoneight234
      7pqrstsixteen`,
        expected: 281,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
})
