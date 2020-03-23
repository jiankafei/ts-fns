/**
 * @module function
 */

import { getObjectHash } from './object.js'

/** */
export function compute_(fn, expire = 60000) {
  const cache = {}

  const recycle = () => {
    const keys = Object.keys(cache)
    keys.forEach((key) => {
      const { time } = cache[key]
      if (time + expire <= Date.now()) {
        delete cache[key]
      }
    })
    setTimeout(recycle, 1000)
  }

  if (expire > 0) {
    recycle()
  }

  return function(...args) {
    const hash = getObjectHash(args)
    if (hash in cache) {
      const item = cache[hash]
      return item.result
    }

    const result = fn.apply(this, args)
    const time = Date.now()
    cache[hash] = { result, time }

    return result
  }
}

/** */
export function get_(fn) {
  let iscalling = false
  let cache = null

  return function() {
    if (iscalling) {
      return cache
    }

    Promise.resolve().then(() => {
      iscalling = false
      cache = null
    })

    iscalling = true

    const result = fn.call(this)
    cache = result
    return result
  }
}

/** */
export function async_(fn, expire = 0) {
  const cache = {}

  const recycle = () => {
    const keys = Object.keys(cache)
    keys.forEach((key) => {
      const { time } = cache[key]
      if (time + expire <= Date.now()) {
        delete cache[key]
      }
    })
    setTimeout(recycle, 1000)
  }

  if (expire > 0) {
    recycle()
  }

  return function(...args) {
    const hash = getObjectHash(args)
    if (hash in cache) {
      const item = cache[hash]
      return item.deferer
    }

    const deferer = new Promise((resolve, reject) => {
      Promise.resolve().then(() => fn.apply(this, args)).then(resolve).catch(reject).finally(() => {
        if (expire > 0) {
          return
        }
        delete cache[hash]
      })
    })
    const time = Date.now()
    cache[hash] = { deferer, time }

    return deferer
  }
}

/** */
export function invoke_(fn, count = 1) {
  const cache = {}

  return function(...args) {
    const hash = getObjectHash(args)
    const item = cache[hash]

    if (item) {
      if (item.invoked > count) {
        delete cache[hash]
      }
      else {
        item.invoked ++
        return item.result
      }
    }

    const result = fn.apply(this, args)
    cache[hash] = { result, invoked: 1 }

    return result
  }
}

/** */
export function pipe_(...fns) {
  return (...args) => {
    let result = fns.shift()(...args)
    for (let i = 0, len = fns.length; i < len; i ++) {
      const fn = fns[i]
      result = fn(result)
    }
    return result
  }
}
