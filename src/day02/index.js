import run from "aocrunner"

const parseInput = (rawInput) => rawInput

function Round(round) {
  this.red = round.red
  this.blue = round.blue
  this.green = round.green
}

Round.create = function (rawRound) {
  const round = rawRound.split(",").reduce(
    (acc, cube) => {
      const [count, color] = cube.trim().split(" ")
      acc[color] = parseInt(count)
      return acc
    },
    { blue: 0, green: 0, red: 0 },
  )

  return new Round(round)
}

Round.prototype.isValid = function () {
  return this.red <= 12 && this.green <= 13 && this.blue <= 14
}

function Game(id, rounds) {
  this.id = parseInt(id)
  this.rounds = rounds
}

Game.create = function (rawGame) {
  const [left, right] = rawGame.split(":")
  const id = left.match(/Game (\d+)/)[1]
  const rawRounds = right.split(";")
  const rounds = rawRounds.map((rawRound) => Round.create(rawRound))
  return new Game(id, rounds)
}

Game.prototype.isValid = function () {
  return this.rounds.every((round) => round.isValid())
}

Game.prototype.getMinimumColorCountsForValidGameForColor = function (color) {
  return this.rounds.reduce(
    (max, round) => (round[color] > max ? round[color] : max),
    0,
  )
}

Game.prototype.getMinimumColorCountsForValidGame = function () {
  return {
    green: this.getMinimumColorCountsForValidGameForColor("green"),
    blue: this.getMinimumColorCountsForValidGameForColor("blue"),
    red: this.getMinimumColorCountsForValidGameForColor("red"),
  }
}

const part1 = (rawInput) => {
  const input = parseInput(rawInput)
  const lines = input.split("\n")
  const games = lines.map((line) => Game.create(line))
  const possibleGames = games.filter((game) => game.isValid())
  const possibleGameIds = possibleGames.map((game) => game.id)
  return possibleGameIds.reduce((acc, id) => acc + id, 0)
}

const part2 = (rawInput) => {
  const input = parseInput(rawInput)
  const lines = input.split("\n")
  const games = lines.map((line) => Game.create(line))
  const gameColorMetrics = games.map((game) =>
    game.getMinimumColorCountsForValidGame(),
  )

  return gameColorMetrics
    .map((game) => game.blue * game.red * game.green)
    .reduce((acc, product) => acc + product, 0)
}

run({
  part1: {
    tests: [
      {
        input: `Game 1: 3 blue, 4 red; 1 red, 2 green, 6 blue; 2 green
Game 2: 1 blue, 2 green; 3 green, 4 blue, 1 red; 1 green, 1 blue
Game 3: 8 green, 6 blue, 20 red; 5 blue, 4 red, 13 green; 5 green, 1 red
Game 4: 1 green, 3 red, 6 blue; 3 green, 6 red; 3 green, 15 blue, 14 red
Game 5: 6 red, 1 blue, 3 green; 2 blue, 1 red, 2 green`,
        expected: 8,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `Game 1: 3 blue, 4 red; 1 red, 2 green, 6 blue; 2 green
Game 2: 1 blue, 2 green; 3 green, 4 blue, 1 red; 1 green, 1 blue
Game 3: 8 green, 6 blue, 20 red; 5 blue, 4 red, 13 green; 5 green, 1 red
Game 4: 1 green, 3 red, 6 blue; 3 green, 6 red; 3 green, 15 blue, 14 red
Game 5: 6 red, 1 blue, 3 green; 2 blue, 1 red, 2 green`,
        expected: 2286,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
})
