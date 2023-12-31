import run from "aocrunner"

const parseInput = (rawInput) =>
  rawInput
    .split("\n")
    .map((line) => line.split(" "))
    .map(([springs, rawGroups]) => {
      const groups = rawGroups.split(",").map((v) => parseInt(v))
      return { springs, groups }
    })

const hash = (springs, groups) => JSON.stringify({ springs, groups })

const countPermutations = (springs, groups, map) => {
  const key = hash(springs, groups)
  if (map.has(key)) {
    return map.get(key)
  }

  if (springs === "") {
    return groups.length === 0 ? 1 : 0
  }

  const first = springs[0]
  let permutations = 0
  switch (first) {
    case ".": {
      permutations = countPermutations(springs.substring(1), groups, map)
      break
    }
    case "?": {
      permutations =
        countPermutations("." + springs.substring(1), groups, map) +
        countPermutations("#" + springs.substring(1), groups, map)
      break
    }
    case "#": {
      if (!groups.length) {
        permutations = 0
      } else {
        const damaged = groups[0]
        if (
          damaged <= springs.length &&
          springs
            .substring(0, damaged)
            .split("")
            .every((c) => c === "#" || c === "?")
        ) {
          const newGroups = groups.slice(1)
          if (damaged === springs.length) {
            permutations = !newGroups.length ? 1 : 0
          } else if (springs.charAt(damaged) === ".") {
            permutations = countPermutations(
              springs.substring(damaged + 1),
              newGroups,
              map,
            )
          } else if (springs.charAt(damaged) === "?") {
            permutations = countPermutations(
              "." + springs.substring(damaged + 1),
              newGroups,
              map,
            )
          } else {
            permutations = 0
          }
        } else {
          permutations = 0
        }
      }
    }
  }
  map.set(key, permutations)
  return permutations
}

const part1 = (rawInput) => {
  const lines = parseInput(rawInput)
  const map = new Map()
  return lines
    .map(({ springs, groups }) => countPermutations(springs, groups, map))
    .reduce((sum, v) => sum + v, 0)
}

const unfoldGroups = (groups) => {
  const unfoldedGroups = []
  for (let i = 0; i < 5; i++) {
    unfoldedGroups.push(...groups)
  }
  return unfoldedGroups
}

const unfoldSprings = (springs) => {
  let unfoldedSprings = ""
  for (let i = 0; i < 4; i++) {
    unfoldedSprings += springs + "?"
  }
  unfoldedSprings += springs
  return unfoldedSprings
}

const unfold = (line) => {
  const { springs, groups } = line
  return { springs: unfoldSprings(springs), groups: unfoldGroups(groups) }
}

const part2 = (rawInput) => {
  const lines = parseInput(rawInput)
  const map = new Map()
  return lines
    .map((line) => unfold(line))
    .map(({ springs, groups }) => countPermutations(springs, groups, map))
    .reduce((sum, v) => sum + v, 0)
}

run({
  part1: {
    tests: [
      {
        input: `
      ???.### 1,1,3
      .??..??...?##. 1,1,3
      ?#?#?#?#?#?#?#? 1,3,1,6
      ????.#...#... 4,1,1
      ????.######..#####. 1,6,5
      ?###???????? 3,2,1
      `,
        expected: 21,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `
???.### 1,1,3
.??..??...?##. 1,1,3
?#?#?#?#?#?#?#? 1,3,1,6
????.#...#... 4,1,1
????.######..#####. 1,6,5
?###???????? 3,2,1`,
        expected: 525152,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
})
