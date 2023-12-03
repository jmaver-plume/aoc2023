import run from "aocrunner"

const parseInput = (rawInput) => rawInput

const parseMatrix = (str) => str.split("\n").map((row) => row.split(""))

function Position(x, y) {
  this.x = x
  this.y = y
}

Position.prototype.isInBounds = function (matrix) {
  const isXInBounds = this.x >= 0 && this.x < matrix.length
  const isYInBounds = this.x >= 0 && this.x < matrix[this.y].length

  return isXInBounds && isYInBounds
}

Position.prototype.isSymbol = function (matrix) {
  if (!this.isInBounds(matrix)) {
    return false
  }

  return isNaN(matrix[this.y][this.x]) && matrix[this.y][this.x] !== "."
}

Position.prototype.isMultiplier = function (matrix) {
  if (!this.isInBounds(matrix)) {
    return false
  }

  return matrix[this.y][this.x] === "*"
}

Position.prototype.isNumber = function (matrix) {
  if (!this.isInBounds(matrix)) {
    return false
  }

  return !isNaN(matrix[this.y][this.x])
}

Position.prototype.getNumberPosition = function (matrix) {
  let leftX = this.x
  let rightX = this.x

  while (new Position(leftX - 1, this.y).isNumber(matrix)) {
    leftX--
  }

  while (new Position(rightX + 1, this.y).isNumber(matrix)) {
    rightX++
  }

  return new NumberPosition(leftX, rightX, this.y)
}

function NumberPosition(leftX, rightX, y) {
  this.leftX = leftX
  this.rightX = rightX
  this.y = y
}

NumberPosition.prototype.getNumber = function (matrix) {
  const numberStr = matrix[this.y].slice(this.leftX, this.rightX + 1).join("")
  const number = parseInt(numberStr, 10)

  if (isNaN(number)) {
    throw new Error("Invalid number extraction.")
  }

  return number
}

NumberPosition.prototype.encrypt = function () {
  return `${this.leftX}-${this.rightX}:${this.y}`
}

NumberPosition.decrypt = function (encrypted) {
  const [x, y] = encrypted.split(":")
  const [leftX, rightX] = x.split("-")
  return new NumberPosition(parseInt(leftX), parseInt(rightX), parseInt(y))
}

const part1 = (rawInput) => {
  const input = parseInput(rawInput)
  const matrix = parseMatrix(input)

  const encryptedNumberPositions = new Set()
  for (let y = 0; y < matrix.length - 1; y++) {
    for (let x = 0; x < matrix[0].length - 1; x++) {
      const position = new Position(x, y)
      if (position.isSymbol(matrix)) {
        const directions = [
          [-1, 0],
          [-1, 1],
          [0, 1],
          [1, 1],
          [1, 0],
          [1, -1],
          [0, -1],
          [-1, -1],
        ]
        directions.forEach(([dx, dy]) => {
          const position = new Position(x + dx, y + dy)
          if (position.isNumber(matrix)) {
            const numberPosition = position.getNumberPosition(matrix)
            const encrypted = numberPosition.encrypt()
            encryptedNumberPositions.add(encrypted)
          }
        })
      }
    }
  }

  return Array.from(encryptedNumberPositions)
    .map((encrypted) => NumberPosition.decrypt(encrypted))
    .map((numberPosition) => numberPosition.getNumber(matrix))
    .reduce((acc, number) => acc + number, 0)
}

const part2 = (rawInput) => {
  const input = parseInput(rawInput)
  const matrix = parseMatrix(input)

  let sum = 0
  for (let y = 0; y < matrix.length - 1; y++) {
    for (let x = 0; x < matrix[0].length - 1; x++) {
      const position = new Position(x, y)
      if (position.isMultiplier(matrix)) {
        const numbers = new Set()
        const directions = [
          [-1, 0],
          [-1, 1],
          [0, 1],
          [1, 1],
          [1, 0],
          [1, -1],
          [0, -1],
          [-1, -1],
        ]
        directions.forEach(([dx, dy]) => {
          const newPosition = new Position(x + dx, y + dy)
          if (newPosition.isNumber(matrix)) {
            const numberPosition = newPosition.getNumberPosition(matrix)
            const encrypted = numberPosition.encrypt()
            numbers.add(encrypted)
          }
        })

        if (numbers.size === 2) {
          const array = Array.from(numbers)
          const first = NumberPosition.decrypt(array[0]).getNumber(matrix)
          const second = NumberPosition.decrypt(array[1]).getNumber(matrix)
          const product = first * second
          sum += product
        }
      }
    }
  }

  return sum
}

run({
  part1: {
    tests: [
      {
        input: `467..114..
...*......
..35..633.
......#...
617*......
.....+.58.
..592.....
......755.
...$.*....
.664.598..`,
        expected: 4361,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `467..114..
...*......
..35..633.
......#...
617*......
.....+.58.
..592.....
......755.
...$.*....
.664.598..`,
        expected: 467835,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
})
