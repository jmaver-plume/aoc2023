import _ from "lodash"
import assert from "node:assert"
import { heapSort } from "./index.js"

export class MinHeap {
  /**
   *
   * @param {(a: T, b: T) => number} cmp Returns greater than 0 if a is greater than b.
   * @param {(value: T) => string} key
   */
  constructor(cmp, key) {
    this.cmp = cmp
    this.key = key

    /**
     * Internal representation of binary heap using an array.
     * First element in the array is unused.
     * @private
     * @type {T[]}
     */
    this.A = [null]

    /**
     * Key to {@link this.array} index map needed for {@link this.decrease}.
     * @private
     * @type {{ [key: string]: number}}
     */
    this.M = {}
  }

  size() {
    return this.A.length - 1
  }

  isEmpty() {
    return this.size() === 0
  }

  insert(value) {
    // Push value to the end heap array and in map set to end index
    this.A.push(value)
    this.M[this.key(value)] = this.size()

    // Start at first position and fix up
    let i = this.size()
    while (i > 1) {
      const parent = Math.floor(i / 2)
      if (this.cmp(this.A[i], this.A[parent]) < 0) {
        this.swap(i, parent)
        i = parent
      } else {
        break
      }
    }
  }

  extract() {
    const answer = this.A[1]

    if (this.size() === 1) {
      // If heap no longer has elements reset the map and array
      this.M = {}
      this.A = [undefined]
      return answer
    }

    // Delete answer from the map
    delete this.M[this.key(answer)]

    // Move last value in the array to the front
    const last = this.A.pop()
    this.A[1] = last
    this.M[this.key(last)] = 1

    // Start at the first position and fix down
    let i = 1
    while (2 * i <= this.size()) {
      const left = 2 * i
      const right = 2 * i + 1
      if (right > this.size() || this.cmp(this.A[left], this.A[right]) < 0) {
        if (this.cmp(this.A[i], this.A[left]) > 0) {
          this.swap(i, left)
          i = left
        } else {
          break
        }
      } else {
        if (this.cmp(this.A[i], this.A[right]) > 0) {
          this.swap(i, right)
          i = right
        } else {
          break
        }
      }
    }

    return answer
  }

  /**
   *
   * @param {T} value
   * @param {T} newValue
   */
  decrease(value, newValue) {
    if (this.key(value) !== this.key(newValue)) {
      throw new Error("Keys do not match!")
    }

    let i = this.M[this.key(value)]

    if (this.cmp(this.A[i], newValue) < 0) {
      throw new Error(
        `New value ${newValue.dist} must be smaller than the old value ${this.A[i].dist}!`,
      )
    }

    // We change the value in the arrays ith position to the new value
    // Map does not change
    this.A[i] = newValue

    // Now the ith positions value can be smaller than the parent, so we need to keep fixing up
    while (i > 1) {
      const parent = Math.floor(i / 2)
      if (this.cmp(this.A[i], this.A[parent]) < 0) {
        this.swap(i, parent)
        i = parent
      } else {
        break
      }
    }
  }

  has(value) {
    return this.key(value) in this.M
  }

  /**
   * Swap 2 values by indexes.
   * @private
   * @param {number} i
   * @param {number} j
   */
  swap(i, j) {
    const iValue = this.A[i]

    // Swap the values in the heap
    this.A[i] = this.A[j]
    this.A[j] = iValue

    // Update map
    this.M[this.key(this.A[i])] = i
    this.M[this.key(this.A[j])] = j
  }
}

// Heap assertions
const primitive = new MinHeap(
  (a, b) => a - b,
  (v) => v,
)
primitive.insert(10)
primitive.insert(3)
primitive.insert(5)
primitive.insert(1)
primitive.insert(12)
primitive.insert(8)
primitive.insert(0)
assert.deepEqual(heapSort(primitive), [0, 1, 3, 5, 8, 10, 12])

const object = new MinHeap(
  (a, b) => a.value - b.value,
  (v) => v.id,
)
object.insert({ id: "1", value: 10 })
object.insert({ id: "2", value: 3 })
object.insert({ id: "3", value: 5 })
object.decrease({ id: "3", value: 5 }, { id: "3", value: -10 })
object.insert({ id: "4", value: 1 })
object.insert({ id: "5", value: 12 })
object.insert({ id: "6", value: 8 })
object.insert({ id: "7", value: 0 })
object.decrease({ id: "5", value: 12 }, { id: "5", value: 7 })
assert.deepEqual(heapSort(object), [
  { id: "3", value: -10 },
  { id: "7", value: 0 },
  { id: "4", value: 1 },
  { id: "2", value: 3 },
  { id: "5", value: 7 },
  { id: "6", value: 8 },
  { id: "1", value: 10 },
])
assert.equal(object.isEmpty(), true)
