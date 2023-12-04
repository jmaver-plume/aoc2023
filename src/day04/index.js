import run from "aocrunner"

const parseInput = (rawInput) => rawInput

function Card(id, winningNumbers, myNumbers) {
  this.id = id
  this.winningNumbers = winningNumbers
  this.myNumbers = myNumbers
}

Card.create = function (line) {
  const regex = /Card\s*(\d+):\s*((?:\d+\s*)+)\s*\|\s*((?:\d+\s*)+)/
  const match = line.match(regex)
  const id = match[1]
  const winningNumbers = match[2]
    .trim()
    .split(/\s+/)
    .map((n) => parseInt(n))
  const myNumbers = match[3]
    .trim()
    .split(/\s+/)
    .map((n) => parseInt(n))
  return new Card(id, winningNumbers, myNumbers)
}

Card.prototype.getMatchCount = function () {
  const setOfWinningNumbers = new Set(this.winningNumbers)
  const myWinningNumbers = this.myNumbers.filter((myNumber) =>
    setOfWinningNumbers.has(myNumber),
  )

  return myWinningNumbers.length
}

Card.prototype.getPoints = function () {
  const matchCount = this.getMatchCount()
  if (matchCount === 0) {
    return 0
  }

  return Math.pow(2, matchCount - 1)
}

const part1 = (rawInput) => {
  const input = parseInput(rawInput)
  const lines = input.split("\n")
  return lines
    .map((line) => Card.create(line))
    .map((card) => card.getPoints())
    .reduce((acc, points) => acc + points, 0)
}

const part2 = (rawInput) => {
  const input = parseInput(rawInput)
  const lines = input.split("\n")
  const cardsWithCounts = lines
    .map((line) => Card.create(line))
    .map((card) => ({ card, count: 1 }))

  cardsWithCounts.forEach(({ card, count }, index) => {
    const matchCount = card.getMatchCount()

    for (let i = 1; i <= matchCount; i++) {
      cardsWithCounts[index + i].count += count
    }
  })

  return cardsWithCounts.reduce((acc, { count }) => acc + count, 0)
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
