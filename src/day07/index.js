import run from "aocrunner"
import _ from "lodash"

const CARD_ORDER = {
  A: 14,
  K: 13,
  Q: 12,
  J: 11,
  T: 10,
  9: 9,
  8: 8,
  7: 7,
  6: 6,
  5: 5,
  4: 4,
  3: 3,
  2: 2,
}

const CARD_ORDER_PART_2 = {
  A: 14,
  K: 13,
  Q: 12,
  T: 10,
  9: 9,
  8: 8,
  7: 7,
  6: 6,
  5: 5,
  4: 4,
  3: 3,
  2: 2,
  J: 0,
}

const JOKER = "J"

const HAND_RANK = {
  FIVE_OF_A_KIND: 7,
  FOUR_OF_A_KIND: 6,
  FULL_HOUSE: 5,
  THREE_OF_A_KIND: 4,
  TWO_PAIR: 3,
  ONE_PAIR: 2,
  HIGH_CARD: 1,
}

const REPLACEMENTS = _.keys(_.omit(CARD_ORDER, JOKER))

function Play(hand, bet) {
  this.hand = hand
  this.bet = bet
}

Play.prototype.evaluateBestHandWithReplacements = function () {
  if (!this.hand.cards.includes(JOKER)) {
    this.bestHandWithReplacements = this.hand
    return
  }

  const possibleHands = REPLACEMENTS.map((replacement) =>
    this.hand.cards.replaceAll(JOKER, replacement),
  ).map((cards) => new Hand(cards))

  possibleHands.sort((a, b) => compareHands(b, a))

  this.bestHandWithReplacements = possibleHands[0]
}

function Hand(cards, bet) {
  this.cards = cards
  this.bet = bet

  this.evaluateRank()
}

Hand.prototype.evaluateRank = function () {
  const counts = _.values(_.countBy(this.cards.split(""), _.identity))

  const isFiveOfAKind = counts.length === 1
  if (isFiveOfAKind) {
    this.rank = HAND_RANK.FIVE_OF_A_KIND
    return
  }

  const isFourOfAKind = counts.includes(4)
  if (isFourOfAKind) {
    this.rank = HAND_RANK.FOUR_OF_A_KIND
    return
  }

  const isFullHouse = counts.includes(3) && counts.includes(2)
  if (isFullHouse) {
    this.rank = HAND_RANK.FULL_HOUSE
    return
  }

  const isThreeOfAKind = counts.includes(3)
  if (isThreeOfAKind) {
    this.rank = HAND_RANK.THREE_OF_A_KIND
    return
  }

  const isTwoPair = counts.filter((count) => count === 2).length === 2
  if (isTwoPair) {
    this.rank = HAND_RANK.TWO_PAIR
    return
  }

  const isOnePair = counts.includes(2)
  if (isOnePair) {
    this.rank = HAND_RANK.ONE_PAIR
    return
  }

  this.rank = HAND_RANK.HIGH_CARD
}

const parseInput = (rawInput) =>
  rawInput
    .split("\n")
    .map((line) => line.split(" "))
    .map(([cards, bet]) => new Play(new Hand(cards), parseInt(bet)))

function compareHands(a, b) {
  const rankComparison = a.rank - b.rank
  if (rankComparison !== 0) {
    return rankComparison
  }

  const HAND_SIZE = 5
  for (let i = 0; i < HAND_SIZE; i++) {
    const cardComparison = CARD_ORDER[a.cards[i]] - CARD_ORDER[b.cards[i]]
    if (cardComparison !== 0) {
      return cardComparison
    }
  }

  return 0
}

function comparePlaysPart1(a, b) {
  return compareHands(a.hand, b.hand)
}

const part1 = (rawInput) => {
  const plays = parseInput(rawInput)
  plays.sort(comparePlaysPart1)
  return plays.reduce((sum, { bet }, index) => sum + bet * (index + 1), 0)
}

function comparePlaysPart2(a, b) {
  const rankComparison =
    a.bestHandWithReplacements.rank - b.bestHandWithReplacements.rank
  if (rankComparison !== 0) {
    return rankComparison
  }

  const HAND_SIZE = 5
  for (let i = 0; i < HAND_SIZE; i++) {
    const cardComparison =
      CARD_ORDER_PART_2[a.hand.cards[i]] - CARD_ORDER_PART_2[b.hand.cards[i]]
    if (cardComparison !== 0) {
      return cardComparison
    }
  }

  return 0
}

const part2 = (rawInput) => {
  const plays = parseInput(rawInput)
  plays.forEach((play) => play.evaluateBestHandWithReplacements())
  plays.sort(comparePlaysPart2)
  return plays.reduce((sum, { bet }, index) => sum + bet * (index + 1), 0)
}

run({
  part1: {
    tests: [
      {
        input: `32T3K 765
T55J5 684
KK677 28
KTJJT 220
QQQJA 483`,
        expected: 6440,
      },
      {
        input: `22T96 3
22TKA 4`,
        expected: 11,
      },
      {
        input: `22J43 3
22TKA 4`,
        expected: 10,
      },
      {
        input: `KKKAJ 3
QQQAA 4`,
        expected: 11,
      },
      {
        input: `2345A 1
Q2KJJ 13
Q2Q2Q 19
T3T3J 17
T3Q33 11
2345J 3
J345A 2
32T3K 5
T55J5 29
KK677 7
KTJJT 34
QQQJA 31
JJJJJ 37
JAAAA 43
AAAAJ 59
AAAAA 61
2AAAA 23
2JJJJ 53
JJJJ2 41`,
        expected: 6592,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `32T3K 765
T55J5 684
KK677 28
KTJJT 220
QQQJA 483`,
        expected: 5905,
      },
      {
        input: `2345A 1
Q2KJJ 13
Q2Q2Q 19
T3T3J 17
T3Q33 11
2345J 3
J345A 2
32T3K 5
T55J5 29
KK677 7
KTJJT 34
QQQJA 31
JJJJJ 37
JAAAA 43
AAAAJ 59
AAAAA 61
2AAAA 23
2JJJJ 53
JJJJ2 41`,
        expected: 6839,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
})
