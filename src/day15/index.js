import run from "aocrunner"
import _ from "lodash"

const stringify = (head) => {
  let str = ""
  let current = head
  while (current !== null) {
    str += `[${current.value[0]} ${current.value[2]}]`
    current = current.next
  }
  return str
}

const log = (boxes) => {
  // Box 0: [rn 1] [cm 2]
  // Box 3: [ot 9] [ab 5] [pc 6]
  boxes.forEach((box, i) => {
    if (box === null) {
      return
    }

    console.log(`Box ${i}: ${stringify(box)}`)
  })
}

const logStep = (step, boxes) => {
  console.log(`After ${step.join("")}: `)
  log(boxes)
  console.log("\n")
}

const parseInput = (rawInput) => rawInput.split(",")

const hash = (string) =>
  string
    .split("")
    .map((char) => char.charCodeAt())
    .reduce((hash, ascii) => ((hash + ascii) * 17) % 256, 0)

const part1 = (rawInput) => {
  const strings = parseInput(rawInput)

  const hashes = strings.map((string) => hash(string))
  return _.sum(hashes)
}

const find = (head, label) => {
  let current = head
  while (current !== null) {
    if (current.value[0] === label) {
      return current
    }

    current = current.next
  }
}

const insert = (head, value) => {
  let current = head
  while (current.next !== null) {
    current = current.next
  }

  current.next = { next: null, value }
}

const remove = (head, label) => {
  let prev = head
  let current = head.next
  while (current !== null) {
    if (current.value[0] === label) {
      prev.next = current.next
      return
    }

    prev = current
    current = current.next
  }
}

const getBoxValue = (box) => {
  const results = []
  let slot = 1
  let current = box
  while (current !== null) {
    results.push(slot * current.value[2])
    current = current.next
    slot += 1
  }

  return _.sum(results)
}

const part2 = (rawInput) => {
  const strings = parseInput(rawInput)
  const steps = strings.map((string) => string.split(/([-=])/))

  const boxes = new Array(256).fill(null)
  const labelsInBoxes = new Set()

  steps.forEach((step) => {
    const [label, operation, value] = step
    const boxIndex = hash(label)
    const box = boxes[boxIndex]
    if (operation === "=") {
      if (labelsInBoxes.has(label)) {
        const item = find(box, label)
        item.value = step
      } else {
        if (box === null) {
          boxes[boxIndex] = { value: step, next: null }
        } else {
          insert(box, step)
        }
        labelsInBoxes.add(label)
      }
    } else {
      if (labelsInBoxes.has(label)) {
        if (box.next === null) {
          boxes[boxIndex] = null
        } else if (box.value[0] === label) {
          boxes[boxIndex] = box.next
        } else {
          remove(box, label)
        }

        labelsInBoxes.delete(label)
      }
    }

    // Uncomment to get logs
    // logStep(step, boxes)
  })

  return boxes
    .map((box) => getBoxValue(box))
    .map((value, index) => value * (index + 1))
    .reduce((sum, v) => sum + v, 0)
}

run({
  part1: {
    tests: [
      {
        input: `HASH`,
        expected: 52,
      },
      {
        input: `rn=1,cm-,qp=3,cm=2,qp-,pc=4,ot=9,ab=5,pc-,pc=6,ot=7`,
        expected: 1320,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `rn=1,cm-,qp=3,cm=2,qp-,pc=4,ot=9,ab=5,pc-,pc=6,ot=7`,
        expected: 145,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
})
