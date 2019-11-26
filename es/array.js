/**
 * @module array
 */

import { inArray, isNaN, isString, isArray, isFunction } from './is.js'

/** */
export function createArray(value, count = 1) {
  return [].fill.call(new Array(count), value)
}

/** */
export function unionArray(a, b) {
  return a.concat(b.filter(v => !inArray(v, a)))
}

/** */
export function interArray(a, b) {
  return a.filter(v => b.includes(v))
}

/** */
export function diffArray(a, b) {
  return a.filter(v => !b.includes(v))
}

/** */
export function compArray(a, b) {
  const diffa = diffArray(a, b)
  const diffb = diffArray(b, a)
  return diffa.concat(diffb)
}

/** */
export function uniqueArray(arr, prop) {
  const exists = []
  return arr.filter((item) => {
    if (prop) {
      let value = item[prop]
      if (exists.includes(value)) {
        return false
      }
      else {
        exists.push(value)
        return true
      }
    }
    else {
      if (exists.includes(item)) {
        return false
      }
      else {
        exists.push(item)
        return true
      }
    }
  })
}

/** */
export function sortArray(items, by, decs = false) {
  const res = [].concat(items)
  res.sort((a, b) => {
    let oa = by ? a[by] : a
    let ob = by ? b[by] : b

    oa = !isNaN(+oa) ? +oa : isString(oa) ? oa : 10
    ob = !isNaN(+ob) ? +ob : isString(ob) ? ob : 10

    if (oa < ob) {
      return decs ? 1 : -1
    }
    if (oa === ob) {
      return 0
    }
    if (oa > ob) {
      return decs ? -1 : 1
    }
  })
  return res
}

/** */
export function toArray(arr) {
  return Array.from(arr)
}

/** */
export function flatArray(arr) {
  const res = []
  arr.forEach((item) => {
    const items = isArray(item) ? item : [item]
    res.push(...items)
  })
  return res
}

/** */
export function groupArray(arr, count) {
  const results = []
  arr.forEach((item, i) => {
    const index = parseInt(i / count)
    results[index] = results[index] || []
    results[index].push(item)
  })
  return results
}

/**
 * split an array to sevral
 * @param {*} arr
 * @param {*|function} split
 */
export function splitArray(arr, split) {
  const results = []
  let temp = []
  arr.forEach((item, i) => {
    if (split === item || (isFunction(split) && split(item, i))) {
      results.push(temp)
      temp = []
    }
    else {
      temp.push(item)
      if (i === arr.length - 1) {
        results.push(temp)
      }
    }
  })
  return results
}

/** */
export function joinArray(arr, join) {
  const results = []
  arr.forEach((items) => {
    results.push(...items, join)
  })
  return results
}
