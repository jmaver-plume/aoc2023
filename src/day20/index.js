import run from "aocrunner"
import _ from "lodash"
import * as fs from "fs"
import { exec } from "child_process"
import { findCommonDenominator } from "../utils/index.js"

class Pulse {
  /**
   *
   * @param {string} source
   * @param {string} sink
   * @param {"high" | "low"} value
   */
  constructor(source, sink, value) {
    this.source = source
    this.sink = sink
    this.value = value
  }

  log() {
    // console.log(`${this.source} -${this.value}-> ${this.sink}`)
  }
}

class Counter {
  constructor() {
    this.low = 0
    this.high = 0
  }

  /**
   *
   * @param {"low" | "high"}pulse
   * @param {number} amount
   */
  increment(pulse, amount) {
    this[pulse] += amount
  }

  /**
   *
   * @param {number} amount
   */
  incrementHigh(amount) {
    this.high += amount
  }

  /**
   *
   * @param {number} amount
   */
  incrementLow(amount) {
    this.low += amount
  }
}

/**
 * Flip-flop modules (prefix %) are either on or off; they are initially off.
 * If a flip-flop module receives a high pulse, it is ignored and nothing happens.
 * However, if a flip-flop module receives a low pulse, it flips between on and off.
 * If it was off, it turns on and sends a high pulse. If it was on, it turns off and sends a low pulse.
 */
class FlipFlop extends Counter {
  /**
   *
   * @param {string} id
   * @param {string[]} sinks
   */
  constructor(id, sinks) {
    super()
    this.id = id
    this.sinks = sinks
    this.on = false
  }

  /**
   *
   * @param {Pulse} pulse
   * @return {Pulse[] | null}
   */
  process(pulse) {
    if (pulse.value === "high") {
      return null
    }

    if (this.on) {
      this.on = false
      this.incrementLow(this.sinks.length)
      return this.sinks.map((sink) => new Pulse(this.id, sink, "low"))
    }

    this.on = true
    this.incrementHigh(this.sinks.length)
    return this.sinks.map((sink) => new Pulse(this.id, sink, "high"))
  }
}

/**
 * Conjunction modules (prefix &) remember the type of the most recent pulse received from each of their connected input modules;
 * they initially default to remembering a low pulse for each input.
 * When a pulse is received, the conjunction module first updates its memory for that input.
 * Then, if it remembers high pulses for all inputs, it sends a low pulse; otherwise, it sends a high pulse.
 */
class Conjunction extends Counter {
  /**
   *
   * @param {string} id
   * @param {string[]} sources
   * @param {string[]} sinks
   */
  constructor(id, sources, sinks) {
    super()
    this.id = id
    this.sinks = sinks
    /**
     *
     * @type {Dictionary<"low" | "high">}
     */
    this.sources = _.fromPairs(sources.map((key) => [key, "low"]))
  }

  /**
   *
   * @param {Pulse} pulse
   * @return {Pulse[]}
   */
  process(pulse) {
    this.sources[pulse.source] = pulse.value
    const allPulsesAreHigh = _.values(this.sources).every(
      (value) => value === "high",
    )
    const pulseToSend = allPulsesAreHigh ? "low" : "high"
    this.increment(pulseToSend, this.sinks.length)
    return this.sinks.map((sink) => new Pulse(this.id, sink, pulseToSend))
  }
}

/**
 * There is a single broadcast module (named broadcaster).
 * When it receives a pulse, it sends the same pulse to all of its destination modules.
 */
class Broadcaster extends Counter {
  /**
   *
   * @param {string[]} sinks
   */
  constructor(sinks) {
    super()
    this.id = "broadcaster"
    this.sinks = sinks
  }

  /**
   *
   * @param {Pulse} pulse
   * @return {Pulse[]}
   */
  process(pulse) {
    this.increment(pulse.value, this.sinks.length)
    return this.sinks.map((sink) => new Pulse(this.id, sink, pulse.value))
  }
}

/**
 * Here at Desert Machine Headquarters, there is a module with a single button on it called, aptly, the button module.
 * When you push the button, a single low pulse is sent directly to the broadcaster module.
 */
class Button extends Counter {
  constructor(sinks) {
    super()
    this.id = "button"
    this.sinks = sinks
  }

  /**
   *
   * @return {Pulse}
   */
  press() {
    const pulse = "low"
    this.increment(pulse, 1)
    return this.sinks.map((sink) => new Pulse(this.id, sink, pulse))
  }
}

const createModulesFromEdges = (edges) => {
  return _.keyBy(
    _.uniq(edges.map(({ src }) => src)).map((vertice) => {
      const sinks = edges
        .filter(({ src }) => src === vertice)
        .map(({ dest }) => dest)

      if (vertice.startsWith("&")) {
        const sources = edges
          .filter(({ dest }) => dest === vertice)
          .map(({ src }) => src)
        return new Conjunction(vertice, sources, sinks)
      }

      if (vertice.startsWith("%")) {
        return new FlipFlop(vertice, sinks)
      }

      if (vertice === "broadcaster") {
        return new Broadcaster(sinks)
      }

      return new Button(sinks)
    }),
    (module) => module.id,
  )
}

const parseEdges = (rawInput) => {
  const map = Object.assign(
    {},
    ...rawInput.split("\n").map((line) => {
      const vertice = line.split(" ")[0]
      const partial =
        vertice.startsWith("%") || vertice.startsWith("&")
          ? vertice.split("").slice(1).join("")
          : vertice

      return { [partial]: vertice }
    }),
  )

  return rawInput
    .split("\n")
    .map((line) => {
      const [source, edges] = line.split(" -> ")
      let fixedEdges = edges
      _.entries(map).forEach((entry) => {
        fixedEdges = fixedEdges.replace(
          new RegExp(`${entry[0]}`, "g"),
          entry[1],
        )
      })

      return [source, fixedEdges].join(" -> ")
    })
    .flatMap((line) => {
      const [source, rawSinks] = line.split(" -> ")
      const sinks = rawSinks.split(",").map((sink) => sink.trim())
      return sinks.map((sink) => ({ src: source, dest: sink }))
    })
}

const press = (modules) => {
  const { button } = modules
  const queue = [...button.press()]
  while (queue.length) {
    const pulse = queue.shift()
    pulse.log()
    const module = modules[pulse.sink]

    const isUntypedModule = !module
    if (isUntypedModule) {
      continue
    }

    const pulses = module.process(pulse)
    if (pulses === null) {
      continue
    }
    queue.push(...pulses)
  }
}

const part1 = (rawInput) => {
  const edges = parseEdges(rawInput)
  edges.push({ src: "button", dest: "broadcaster" })
  const modules = createModulesFromEdges(edges)
  for (let i = 0; i < 1000; i++) {
    press(modules)
  }

  const lowCount = _.sum(_.values(modules).map((m) => m.low))
  const highCount = _.sum(_.values(modules).map((m) => m.high))

  return lowCount * highCount
}

const graphviz = (edges) => {
  const escape = (node) => node.replace("%", "\\%")
  const nodes = _.uniq(edges.flatMap(({ src, dest }) => [src, dest]))
    .map((node) => {
      if (node.startsWith("&")) {
        return `    "${escape(node)}" [style=filled, color=lightblue]\n`
      }

      return `    "${escape(node)}"\n`
    })
    .join("")

  const fixedEdges = edges
    .map((edge) => `"${escape(edge.src)}" -> "${escape(edge.dest)}"`)
    .map((edge) => "    " + edge)
    .join("\n")

  return "digraph G {\n" + nodes + fixedEdges + "\n}"
}

const writeGraphviz = (graph, name) => {
  fs.writeFileSync(`/tmp/${name}.dot`, graph)
  exec(
    `dot -T svg -o /tmp/${name}.svg /tmp/${name}.dot`,
    (error, stdout, stderr) => {
      if (error) {
        console.log(`error: ${error.message}`)
      } else if (stderr) {
        console.log(`stderr: ${stderr}`)
      }
    },
  )
}

const getVerticesFromEdges = (edges) =>
  _.sortedUniq(edges.flatMap(({ src, dest }) => [src, dest]))

/**
 *
 * @param {string[]} vertices
 * @param {{ src: string; dest: string }[]}edges
 * @return {string[][]}
 */
const findConnectedComponents = (vertices, edges) => {
  /**
   * Initialize a dictionary with { [vertice]: null }
   * At the end each vertice will have a value corresponding to the component it belongs to.
   * @type {Dictionary<number | null>}
   */
  const cache = _.fromPairs(vertices.map((v) => [v, null]))

  let count = 1
  vertices.forEach((vertice) => {
    // Vertice is already part of a connected component, so we can skip it.
    if (cache[vertice] !== null) {
      return
    }

    const queue = [vertice]
    while (queue.length) {
      const first = queue.shift()

      // Vertice is already part of a connected component, so we can skip it.
      if (cache[first] !== null) {
        continue
      }

      // Assign vertice to the component
      cache[first] = count

      // Get all dest edges of the vertice
      const next = edges
        .filter(({ src }) => src === first)
        .map(({ dest }) => dest)
      queue.push(...next)
    }

    count += 1
  })

  return _.values(_.groupBy(_.keys(cache), (key) => cache[key]))
}

const part2 = (rawInput) => {
  const edges = parseEdges(rawInput)

  const graph = graphviz(edges)
  writeGraphviz(graph, "graph")

  // I found the edges that I needed to cut by looking at the original graph
  // Each connected component has 1 conjunction which connects to another conjunction.
  // I cut all the broadcaster edges and the edge from conjunction to conjunction.
  const edgesToCut = [
    // First
    {
      src: "broadcaster",
      dest: "%fg",
    },
    {
      src: "&nt",
      dest: "&nd",
    },
    // Second
    {
      src: "broadcaster",
      dest: "%pj",
    },
    {
      src: "&zq",
      dest: "&hf",
    },
    // Third
    {
      src: "broadcaster",
      dest: "%br",
    },
    {
      src: "&vn",
      dest: "&ds",
    },
    // Fourth
    {
      src: "broadcaster",
      dest: "%bh",
    },
    {
      src: "&vv",
      dest: "&sb",
    },
  ]

  const cutEdges = edges.filter(
    (edge) =>
      !edgesToCut.some(
        (edgeToCut) =>
          edge.src === edgeToCut.src && edge.dest === edgeToCut.dest,
      ),
  )

  const cutGraph = graphviz(cutEdges)
  writeGraphviz(cutGraph, "graph-cut")

  const connectedComponents = findConnectedComponents(
    getVerticesFromEdges(cutEdges),
    cutEdges,
  )

  const validConnectedComponents = connectedComponents.filter(
    (v) => v.length > 2,
  )

  const componentEdges = validConnectedComponents.map((vertices) => {
    const edges = cutEdges.filter(
      ({ src, dest }) => vertices.includes(src) || vertices.includes(dest),
    )
    edges.push({ src: "button", dest: "broadcaster" })

    // Re-add cut edge
    if (vertices.includes("%fg")) {
      edges.push({ src: "broadcaster", dest: "%fg" })
    } else if (vertices.includes("%pj")) {
      edges.push({ src: "broadcaster", dest: "%pj" })
    } else if (vertices.includes("%br")) {
      edges.push({ src: "broadcaster", dest: "%br" })
    } else if (vertices.includes("%bh")) {
      edges.push({ src: "broadcaster", dest: "%bh" })
    }

    return edges
  })

  componentEdges.forEach((edges, i) => {
    writeGraphviz(graphviz(edges), `graph-joined-${i}`)
  })

  const componentModules = componentEdges.map((edges) =>
    createModulesFromEdges(edges),
  )

  const counts = componentModules.map((modules) => {
    // We have 1 conjunction module in the connected component
    const conjunction = _.values(modules).find(
      (module) => module instanceof Conjunction,
    )

    for (let i = 1; ; i++) {
      press(modules)
      if (conjunction.low !== 0) {
        return i
      }
    }
  })

  return findCommonDenominator(counts)
}

run({
  part1: {
    tests: [
      {
        input: `
broadcaster -> a, b, c
%a -> b
%b -> c
%c -> inv
&inv -> a`,
        expected: 32000000,
      },
      {
        input: `
broadcaster -> a
%a -> inv, con
&inv -> b
%b -> con
&con -> output`,
        expected: 11687500,
      },
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
