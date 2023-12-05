import run from "aocrunner"

const parseInput = (rawInput) => rawInput

function MyMap(destinationRangeStart, sourceRangeStart, rangeLength) {
  this.rangeLength = rangeLength

  this.destinationRangeStart = destinationRangeStart
  this.destinationRangeEnd = this.destinationRangeStart + (rangeLength - 1)

  this.sourceRangeStart = sourceRangeStart
  this.sourceRangeEnd = this.sourceRangeStart + (rangeLength - 1)
}

MyMap.prototype.getDestination = function (source) {
  if (this.sourceRangeStart <= source && this.sourceRangeEnd >= source) {
    const offset = source - this.sourceRangeStart
    return this.destinationRangeStart + offset
  }

  return null
}

function Almanac(
  seedRanges,
  seedsToSoilMap,
  soilsToFertilizerMap,
  fertilizerToWaterMap,
  waterToLightMap,
  lightToTemperatureMap,
  temperatureToHumidityMap,
  humidityToLocationMap,
) {
  this.seedRanges = seedRanges
  this.seedsToSoilMap = seedsToSoilMap
  this.soilsToFertilizerMap = soilsToFertilizerMap
  this.fertilizerToWaterMap = fertilizerToWaterMap
  this.waterToLightMap = waterToLightMap
  this.lightToTemperatureMap = lightToTemperatureMap
  this.temperatureToHumidityMap = temperatureToHumidityMap
  this.humidityToLocationMap = humidityToLocationMap
}

Almanac.create = function (input, parseSeedRanges) {
  const parseMap = (input) => {
    return input
      .split("\n")
      .slice(1)
      .map((m) => m.split(" ").map((v) => parseInt(v)))
      .map((input) => new MyMap(input[0], input[1], input[2]))
  }

  const parts = input.split("\n\n")
  const seedRanges = parseSeedRanges(parts[0])
  const seedsToSoilMap = parseMap(parts[1])
  const soilsToFertilizerMap = parseMap(parts[2])
  const fertilizerToWaterMap = parseMap(parts[3])
  const waterToLightMap = parseMap(parts[4])
  const lightToTemperatureMap = parseMap(parts[5])
  const temperatureToHumidityMap = parseMap(parts[6])
  const humidityToLocationMap = parseMap(parts[7])

  return new Almanac(
    seedRanges,
    seedsToSoilMap,
    soilsToFertilizerMap,
    fertilizerToWaterMap,
    waterToLightMap,
    lightToTemperatureMap,
    temperatureToHumidityMap,
    humidityToLocationMap,
  )
}

Almanac.prototype.getMapDestination = function (seed, maps) {
  for (let i = 0; i < maps.length; i++) {
    const map = maps[i]
    const destination = map.getDestination(seed)
    if (destination !== null) {
      return destination
    }
  }

  // No mapping destination found, return the same value.
  return seed
}

Almanac.prototype.getLocation = function (seed) {
  const soil = this.getMapDestination(seed, this.seedsToSoilMap)
  const fertilizer = this.getMapDestination(soil, this.soilsToFertilizerMap)
  const water = this.getMapDestination(fertilizer, this.fertilizerToWaterMap)
  const light = this.getMapDestination(water, this.waterToLightMap)
  const temperature = this.getMapDestination(light, this.lightToTemperatureMap)
  const humidity = this.getMapDestination(
    temperature,
    this.temperatureToHumidityMap,
  )
  return this.getMapDestination(humidity, this.humidityToLocationMap)
}

Almanac.prototype.getLowestLocationNumber = function () {
  let lowestLocationNumber = Infinity
  for (let i = 0; i < this.seedRanges.length; i++) {
    console.log("i: ", i, this.seedRanges.length)
    const range = this.seedRanges[i]
    for (let j = 0; j < range[1]; j++) {
      const seed = range[0] + j
      const location = this.getLocation(seed)
      if (location < lowestLocationNumber) {
        lowestLocationNumber = location
      }
    }
  }

  return lowestLocationNumber
}

const part1 = (rawInput) => {
  const input = parseInput(rawInput)

  const parseSeedRanges = (input) => {
    return input
      .split(":")[1]
      .trim()
      .split(" ")
      .map((n) => parseInt(n))
      .map((seed) => [seed, 1])
  }

  const almanac = Almanac.create(input, parseSeedRanges)
  return almanac.getLowestLocationNumber()
}

const part2 = (rawInput) => {
  const input = parseInput(rawInput)

  const parseSeeds = (input) => {
    const numbers = input
      .split(":")[1]
      .trim()
      .split(" ")
      .map((n) => parseInt(n))

    const seedRanges = []
    for (let i = 0; i < numbers.length; i += 2) {
      seedRanges.push([numbers[i], numbers[i + 1]])
    }

    return seedRanges
  }

  const almanac = Almanac.create(input, parseSeeds)
  return almanac.getLowestLocationNumber()
}

run({
  part1: {
    tests: [
      {
        input: `seeds: 79 14 55 13

seed-to-soil map:
50 98 2
52 50 48

soil-to-fertilizer map:
0 15 37
37 52 2
39 0 15

fertilizer-to-water map:
49 53 8
0 11 42
42 0 7
57 7 4

water-to-light map:
88 18 7
18 25 70

light-to-temperature map:
45 77 23
81 45 19
68 64 13

temperature-to-humidity map:
0 69 1
1 0 69

humidity-to-location map:
60 56 37
56 93 4`,
        expected: 35,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `seeds: 79 14 55 13

seed-to-soil map:
50 98 2
52 50 48

soil-to-fertilizer map:
0 15 37
37 52 2
39 0 15

fertilizer-to-water map:
49 53 8
0 11 42
42 0 7
57 7 4

water-to-light map:
88 18 7
18 25 70

light-to-temperature map:
45 77 23
81 45 19
68 64 13

temperature-to-humidity map:
0 69 1
1 0 69

humidity-to-location map:
60 56 37
56 93 4`,
        expected: 46,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
})
