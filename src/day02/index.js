import run from "aocrunner"

const parseInput = (rawInput) => rawInput

const parseGame = (line) => {
  const [left, right] = line.split(":")
  const gameNumber = left.match(/Game (\d+)/)[1]
  return {
    id: gameNumber,
    rounds: right.split(";").map((round) => {
      return round.split(",").reduce((acc, cube) => {
        const [count, color] = cube.trim().split(" ")
        acc[color] = parseInt(count)
        return acc
      }, {})
    }),
  }
}

const isValidRound = (round) => {
  return (
    (round.red === undefined || round.red <= 12) &&
    (round.green === undefined || round.green <= 13) &&
    (round.blue === undefined || round.blue <= 14)
  )
}

const isValidGame = (game) => {
  return game.rounds.every((round) => isValidRound(round))
}

const sum = (numbers) => numbers.reduce((sum, number) => number + sum, 0)

const part1 = (rawInput) => {
  const input = parseInput(rawInput)
  const lines = input.split("\n")
  const games = lines.map((line) => parseGame(line))
  const possibleGames = games.filter((game) => isValidGame(game))
  const possibleGameIds = possibleGames.map((game) => parseInt(game.id))
  return sum(possibleGameIds)
}

const getMaxColorInGame = (game, color) => {
  let max = 0
  game.rounds.forEach((round) => {
    if (round[color] && round[color] > max) {
      max = round[color]
    }
  })
  return max
}

const part2 = (rawInput) => {
  const input = parseInput(rawInput)
  const lines = input.split("\n")
  const games = lines.map((line) => parseGame(line))

  const gameColorMetrics = games.map((game) => {
    const blueMax = getMaxColorInGame(game, "blue")
    const redMax = getMaxColorInGame(game, "red")
    const greenMax = getMaxColorInGame(game, "green")

    return {
      id: game.id,
      blue: blueMax,
      red: redMax,
      green: greenMax,
    }
  })

  const colorProductScores = gameColorMetrics.map(
    (game) => game.blue * game.red * game.green,
  )

  return sum(colorProductScores)
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
