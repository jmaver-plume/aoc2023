import run from "aocrunner"
import _ from "lodash"

class Rating {
  constructor(x, m, a, s) {
    this.x = x
    this.m = m
    this.a = a
    this.s = s
  }

  value() {
    return this.x + this.m + this.a + this.s
  }
}

class Condition {
  constructor(operator, operand, variable) {
    this.operator = operator
    this.operand = operand
    this.variable = variable
  }

  evaluate(input) {
    if (this.operator === ">") {
      return input > this.operand
    }

    return input < this.operand
  }
}

class Rule {
  constructor(condition, next) {
    this.condition = condition
    this.next = next
  }
}

class Workflow {
  constructor(name, rules) {
    this.name = name
    this.rules = rules
  }

  evaluate(rating) {
    return this.rules.find((rule) => {
      if (!rule.condition) {
        return true
      }

      const input = rating[rule.condition.variable]
      return rule.condition.evaluate(input)
    }).next
  }
}

const parseInput = (rawInput) => {
  const [rawWorkflows, rawRatings] = rawInput.split("\n\n")

  // Parse workflows
  const workflows = rawWorkflows.split("\n").map((rawWorkflow) => {
    const {
      groups: { name, rules: rawRules },
    } = rawWorkflow.match(/(?<name>.*)\{(?<rules>.*)}/)

    const rules = rawRules.split(",").map((rawRule) => {
      const hasCondition = rawRule.includes(":")
      if (hasCondition) {
        const [rawCondition, workflow] = rawRule.split(":")
        const {
          groups: { variable, operator, operand },
        } = rawCondition.match(/(?<variable>.*)(?<operator>[<>])(?<operand>.*)/)
        const condition = new Condition(operator, parseInt(operand), variable)
        return new Rule(condition, workflow)
      }

      return new Rule(null, rawRule)
    })

    return new Workflow(name, rules)
  })

  // Create workflows map
  const workflowsMap = _.keyBy(workflows, (workflow) => workflow.name)

  // Parse ratings
  const ratings = rawRatings.split("\n").map((rawRating) => {
    // {x=787,m=2655,a=1222,s=2876}
    const dictionary = _.fromPairs(
      rawRating
        .replace(/[{}]/g, "")
        .split(",")
        .map((part) => part.split("=")),
    )
    return new Rating(
      parseInt(dictionary.x),
      parseInt(dictionary.m),
      parseInt(dictionary.a),
      parseInt(dictionary.s),
    )
  })

  return { ratings, workflows, workflowsMap }
}

const part1 = (rawInput) => {
  const { ratings, workflowsMap } = parseInput(rawInput)

  const startWorkflow = workflowsMap.in
  return ratings
    .filter((rating) => {
      let next = startWorkflow.evaluate(rating)
      while (next !== "A" && next !== "R") {
        next = workflowsMap[next].evaluate(rating)
      }
      return next === "A"
    })
    .map((rating) => rating.value())
    .reduce((sum, value) => sum + value, 0)
}

const part2 = (rawInput) => {
  const { workflowsMap } = parseInput(rawInput)

  const calculateIntervals = (path, intervals) => {
    const last = _.last(path)
    if (last === "R") {
      return null
    }

    if (last === "A") {
      // TODO: fix me
      return intervals
    }

    const workflow = workflowsMap[last]
    // true ->
    // false, true ->
    // false, false, true ->
    // false, false, false, true ->
    // ...
    const results = []
    for (let i = 0; i < workflow.rules.length; i++) {
      const clonedIntervals = _.cloneDeep(intervals)
      for (let j = 0; j < i; j++) {
        const falseRule = workflow.rules[j]
        if (falseRule.condition.operator === ">") {
          const candidate = falseRule.condition.operand
          const old = clonedIntervals[falseRule.condition.variable].max
          clonedIntervals[falseRule.condition.variable].max = Math.min(
            candidate,
            old,
          )
        } else {
          const candidate = falseRule.condition.operand
          const old = clonedIntervals[falseRule.condition.variable].min
          clonedIntervals[falseRule.condition.variable].min = Math.max(
            candidate,
            old,
          )
        }
      }

      const trueRule = workflow.rules[i]
      if (!trueRule.condition) {
        results.push(
          calculateIntervals([...path, trueRule.next], clonedIntervals),
        )
      } else {
        // the last one is always true
        if (trueRule.condition.operator === ">") {
          const candidate = trueRule.condition.operand + 1
          const old = clonedIntervals[trueRule.condition.variable].min
          clonedIntervals[trueRule.condition.variable].min = Math.max(
            candidate,
            old,
          )
        } else {
          const candidate = trueRule.condition.operand - 1
          const old = clonedIntervals[trueRule.condition.variable].max
          clonedIntervals[trueRule.condition.variable].max = Math.min(
            candidate,
            old,
          )
        }

        results.push(
          calculateIntervals([...path, trueRule.next], clonedIntervals),
        )
      }
    }

    return _.flattenDeep(results)
  }

  const intervals = calculateIntervals(["in"], {
    x: { min: 1, max: 4000 },
    m: { min: 1, max: 4000 },
    a: { min: 1, max: 4000 },
    s: { min: 1, max: 4000 },
  }).filter((v) => v)

  const getIntervalSize = (interval) => interval.max - interval.min + 1

  const intervalSizes = intervals.map(
    ({ x, m, a, s }) =>
      getIntervalSize(x) *
      getIntervalSize(m) *
      getIntervalSize(a) *
      getIntervalSize(s),
  )

  return _.sum(intervalSizes)
}

run({
  part1: {
    tests: [
      {
        input: `
px{a<2006:qkq,m>2090:A,rfg}
pv{a>1716:R,A}
lnx{m>1548:A,A}
rfg{s<537:gd,x>2440:R,A}
qs{s>3448:A,lnx}
qkq{x<1416:A,crn}
crn{x>2662:A,R}
in{s<1351:px,qqz}
qqz{s>2770:qs,m<1801:hdj,R}
gd{a>3333:R,R}
hdj{m>838:A,pv}

{x=787,m=2655,a=1222,s=2876}
{x=1679,m=44,a=2067,s=496}
{x=2036,m=264,a=79,s=2244}
{x=2461,m=1339,a=466,s=291}
{x=2127,m=1623,a=2188,s=1013}`,
        expected: 19114,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `
px{a<2006:qkq,m>2090:A,rfg}
pv{a>1716:R,A}
lnx{m>1548:A,A}
rfg{s<537:gd,x>2440:R,A}
qs{s>3448:A,lnx}
qkq{x<1416:A,crn}
crn{x>2662:A,R}
in{s<1351:px,qqz}
qqz{s>2770:qs,m<1801:hdj,R}
gd{a>3333:R,R}
hdj{m>838:A,pv}

{x=787,m=2655,a=1222,s=2876}
{x=1679,m=44,a=2067,s=496}
{x=2036,m=264,a=79,s=2244}
{x=2461,m=1339,a=466,s=291}
{x=2127,m=1623,a=2188,s=1013}`,
        expected: 167409079868000,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
})
