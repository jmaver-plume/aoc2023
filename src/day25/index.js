import run from "aocrunner"
import _ from "lodash"
import * as fs from "fs"

const parseInput = (rawInput) => {
  const lines = rawInput.split("\n")
  const vertices = _.uniq(
    lines.flatMap((line) => line.replace(":", "").split(" ")),
  )
  const edges = _.uniqBy(
    lines.flatMap((line) => {
      const vertices = line.replace(":", "").split(" ")
      const src = vertices.shift()
      return vertices.map((vertice) => ({ src, dest: vertice }))
    }),
    (edge) => `${edge.src}:${edge.dest}`,
  )

  const mappedEdges = edges
    .map((edge) => ({
      src: vertices.findIndex((v) => v === edge.src),
      dest: vertices.findIndex((v) => v === edge.dest),
    }))
    .map((edge) =>
      edge.src > edge.dest ? { src: edge.dest, dest: edge.src } : edge,
    )

  const mappedVertices = vertices.map((_, index) => index).sort((a, b) => a - b)

  return { vertices: mappedVertices, edges: mappedEdges }
}

const graphviz = (graph) => {
  const edges = graph.edges
    .map((edge) => `${edge.src} -- ${edge.dest}`)
    .map((edge) => "    " + edge)
    .join("\n")

  return "graph G {\n" + edges + "\n}"
}

const part1 = (rawInput) => {
  const graph = parseInput(rawInput)
  fs.writeFileSync("graph.dot", graphviz(graph))

  // Step 1: Find edges to cut (find them in the svg image )
  //  CLI Command: dot -Kneato -T svg -o graph.svg graph.dot && open graph.svg
  //  Real input
  const edgesToCut = [
    { src: 478, dest: 908 },
    { src: 399, dest: 740 },
    { src: 1098, dest: 1133 },
  ]

  // Step 2: Cut edges
  graph.edges = graph.edges.filter(
    (edge) =>
      !edgesToCut.some(
        (edgeToCut) =>
          edgeToCut.src === edge.src && edgeToCut.dest === edge.dest,
      ),
  )

  // Step 3: Verify the image looks correct
  //  CLI Command: dot -Kneato -T svg -o graph-cut.svg graph-cut.dot && open graph-cut.svg
  fs.writeFileSync("graph-cut.dot", graphviz(graph))

  // Step 4: Find connected components
  // Add "inverse" edges, otherwise it doesn't work (1,3) -> [(1,3), (3,1)]
  graph.edges = graph.edges.flatMap((edge) => [
    edge,
    { src: edge.dest, dest: edge.src },
  ])
  const cache = graph.vertices.map(() => 0)
  const queue = [graph.vertices[0]]
  // We need to find 1 connected component
  while (queue.length) {
    const first = queue.shift()
    if (cache[first] !== 0) {
      continue
    }
    cache[first] = 1
    const next = graph.edges
      .filter((edge) => edge.src === first)
      .map((edge) => edge.dest)
    queue.push(...next)
  }

  const [first, second] = _.partition(cache)
  return first.length * second.length
}

const part2 = (rawInput) => {
  const input = parseInput(rawInput)

  return
}

run({
  part1: {
    tests: [
      //       {
      //         input: `
      // jqt: rhn xhk nvd
      // rsh: frs pzl lsr
      // xhk: hfx
      // cmg: qnr nvd lhk bvb
      // rhn: xhk bvb hfx
      // bvb: xhk hfx
      // pzl: lsr hfx nvd
      // qnr: nvd
      // ntq: jqt hfx bvb xhk
      // nvd: lhk
      // lsr: lhk
      // rzs: qnr cmg lsr rsh
      // frs: qnr lhk lsr`,
      //         expected: 54,
      //       },
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
