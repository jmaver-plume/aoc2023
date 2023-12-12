/**
 * Root for your util libraries.
 *
 * You can import them in the src/template/index.js,
 * or in the specific file.
 *
 * Note that this repo uses ES Modules, so you have to explicitly specify
 * .js extension (yes, .js not .ts - even for TypeScript files)
 * for imports that are not imported from node_modules.
 *
 * For example:
 *
 *   correct:
 *
 *     import _ fro 'lodash
 *     import myLib from '../utils/myLib.js'
 *     import { myUtil } from '../utils/index.js'
 *
 *   incorrect:
 *
 *     import _ fro 'lodash
 *     import myLib from '../utils/myLib'
 *     import { myUtil } from '../utils'
 */

export const getNextPositions = (grid, position, includeDiagonals = false) => {
  const nextPositions = []
  const { row, col } = position
  const maxRow = grid.length
  const maxCol = grid[0].length

  // Up
  if (row > 0) {
    nextPositions.push({ row: row - 1, col })
  }
  // Down
  if (row < maxRow - 1) {
    nextPositions.push({ row: row + 1, col })
  }
  // Left
  if (col > 0) {
    nextPositions.push({ row, col: col - 1 })
  }
  // Right
  if (col < maxCol - 1) {
    nextPositions.push({ row, col: col + 1 })
  }

  // Diagonals
  if (includeDiagonals) {
    // Upper Left
    if (row > 0 && col > 0) {
      nextPositions.push({ row: row - 1, col: col - 1 })
    }
    // Upper Right
    if (row > 0 && col < maxCol - 1) {
      nextPositions.push({ row: row - 1, col: col + 1 })
    }
    // Lower Left
    if (row < maxRow - 1 && col > 0) {
      nextPositions.push({ row: row + 1, col: col - 1 })
    }
    // Lower Right
    if (row < maxRow - 1 && col < maxCol - 1) {
      nextPositions.push({ row: row + 1, col: col + 1 })
    }
  }

  return nextPositions
}

export const gridIterator = function* (grid) {
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[0].length; col++) {
      yield { row, col, value: grid[row][col] }
    }
  }
}

export const logGrid = (grid) => {
  console.log(grid.map((row) => row.join("")).join("\n"))
}

export const parseGrid = (input) =>
  input.split("\n").map((line) => line.split(""))
