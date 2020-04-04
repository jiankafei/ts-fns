/**
 * @module object
 */

import { getStringHash } from './string.js'
import { isArray, isObject, isFile, isDate, isFunction, inArray, isSymbol } from './is.js'

/** */
export function clone(obj) {
  const parents = []
  const clone = function(origin) {
    if (!isObject(origin) && !isArray(origin)) {
      return origin
    }

    const result = isArray(origin) ? [] : {}
    const keys = Object.keys(origin)

    parents.push({ origin, result })

    for (let i = 0, len = keys.length; i < len; i ++) {
      const key = keys[i]
      const value = origin[key]
      const referer = parents.find(item => item.origin === value)

      if (referer) {
        result[key] = referer.result
      }
      else {
        result[key] = clone(value)
      }
    }

    return result
  }

  const result = clone(obj)
  return result
}

/** */
export function merge(obj1, obj2, concatArray = true) {
  obj1 = clone(obj1)

  if (!isArray(obj2) && !isObject(obj2)) {
    return isArray(obj1) && isObject(obj1) ? obj1 : null
  }

  obj2 = clone(obj2)

  if (!isArray(obj1) && !isObject(obj1)) {
    return isArray(obj2) && isObject(obj2) ? obj2 : null
  }

  const exists = []
  const merge = (obj1, obj2) => {
    if (isArray(obj1)) {
      if (isArray(obj2) && concatArray) {
        return [...obj1, ...obj2]
      }
    }

    const result = obj1
    const keys = Object.keys(obj2)
    keys.forEach((key) => {
      const oldValue = obj1[key]
      const newValue = obj2[key]

      if (isObject(newValue) || isArray(newValue)) {
        const index = exists.indexOf(newValue)
        if (index === -1) {
          exists.push(newValue)
        }
        else if (!isArray(oldValue) && !isObject(oldValue)) {
          result[key] = newValue
          return
        }
      }

      if (isObject(newValue) || isArray(newValue)) {
        if (isObject(oldValue) || isArray(oldValue)) {
          result[key] = merge(oldValue, newValue)
        }
        else {
          result[key] = newValue
        }
      }
      else {
        result[key] = newValue
      }
    })
    return result
  }

  return merge(obj1, obj2)
}

/** */
export function stringify(obj) {
  const exists = [obj]
  const used = []
  const stringifyObjectByKeys = (obj) => {
    if (isArray(obj)) {
      let items = obj.map((item) => {
        if (item && typeof item === 'object') {
          return stringifyObjectByKeys(item)
        }
        else {
          return JSON.stringify(item)
        }
      })
      let str = '[' + items.join(',') + ']'
      return str
    }

    let str = '{'
    let keys = Object.keys(obj)
    let total = keys.length
    keys.sort()
    keys.forEach((key, i) => {
      let value = obj[key]
      str += key + ':'

      if (value && typeof value === 'object') {
        let index = exists.indexOf(value)
        if (index > -1) {
          str += '#' + index
          used.push(index)
        }
        else {
          exists.push(value)
          const num = exists.length - 1
          str += '#' + num + stringifyObjectByKeys(value)
        }
      }
      else {
        str += JSON.stringify(value)
      }

      if (i < total - 1) {
        str += ','
      }
    })
    str += '}'
    return str
  }
  let str = stringifyObjectByKeys(obj)

  exists.forEach((item, i) => {
    if (!used.includes(i)) {
      str = str.replace(new RegExp(`:#${i}`, 'g'), ':')
    }
  })

  if (used.includes(0)) {
    str = '#0' + str
  }

  return str
}

/** */
export function getObjectHash(obj) {
  if (typeof obj !== 'object') {
    return
  }

  let str = stringify(obj)
  let hash = getStringHash(str)
  return hash
}

/** */
export function define(obj, key, value) {
  if (isFunction(value)) {
    return Object.defineProperty(obj, key, { get: value })
  }
  else if (isObject(value)) {
    if ('enumerable' in value || 'configurable' in value) {
      return Object.defineProperty(obj, key, value)
    }
    else if ((isFunction(value.set) && isFunction(value.get))) {
      return Object.defineProperty(obj, key, value)
    }
    else {
      return Object.defineProperty(obj, key, { value })
    }
  }
  else {
    return Object.defineProperty(obj, key, { value })
  }
}

/** */
export function flat(obj, determine) {
  const flat = (input, path = '', result = {}) => {
    if (isArray(input)) {
      input.forEach((item, i) => flat(item, `${path}[${i}]`, result))
      return result
    }
    else if (input && typeof input === 'object' && !isFile(input) && !isDate(input)) {
      if (isFunction(determine) && !determine(input)) {
        result[path] = input
        return result
      }

      each(input, (value, key) => {
        flat(value, !path ? key : `${path}[${key}]`, result)
      })
      return result
    }
    else {
      result[path] = input
      return result
    }
  }
  return flat(obj)
}

/** */
export function each(obj, fn) {
  if (isArray(obj)) {
    obj.forEach(fn)
  }
  else {
    const keys = Object.keys(obj)
    keys.forEach((key) => {
      const value = obj[key]
      fn(value, key, obj)
    })
  }
}

/** */
export function map(obj, fn) {
  if (isArray(obj)) {
    return obj.map(fn)
  }
  else {
    const result = {}
    each(obj, (value, key) => {
      result[key] = fn(value, key, obj)
    })
    return result
  }
}

/** */
export function filter(obj, fn) {
  if (isArray(obj)) {
    return obj.filter(fn)
  }
  else {
    const result = {}
    each(obj, (value, key) => {
      const bool = fn(value, key, obj)
      if (!bool) {
        return
      }
      result[key] = value
    })
    return result
  }
}

/** */
export function iterate(obj, fn) {
  if (isArray(obj)) {
    for (let i = 0, len = obj.length; i < len; i ++) {
      const item = obj[i]
      const res = fn(item, i, obj)
      if (res !== undefined) {
        return res
      }
    }
  }
  else {
    const keys = Object.keys(obj)
    for (let i = 0, len = keys.length; i < len; i ++) {
      const key = keys[i]
      const value = obj[key]
      const res = fn(value, key, obj)
      if (res !== undefined) {
        return res
      }
    }
  }
}

/** */
export function find(obj, fn) {
  return iterate(obj, (value, key) => {
    const res = fn(value, key, obj)
    if (res) {
      return value === undefined ? null : value
    }
  })
}

/** */
export function extract(obj, keys) {
  const results = {}
  keys.forEach((key) => {
    if (inObject(key, obj)) {
      results[key] = obj[key]
    }
  })
  return results
}

/**
 * deep freeze
 * @param {*} o
 */
export function freeze(o) {
	if (!Object.freeze) {
		return o
	}

	Object.freeze(o)

	Object.getOwnPropertyNames(o).forEach((prop) => {
		const v = o[prop]
		if (
			Object.prototype.hasOwnProperty.call(o, prop)
			&& v !== null
			&& (typeof v === 'object' || typeof v === 'function')
			&& !Object.isFrozen(v)
		) {
			freeze(v)
		}
	})

	return o
}

/**
 * create a reactive object.
 * it will not change your original data, like clone a new data refererence.
 * @param {object|array} input
 * @param {object} options
 * @param {function} options.get to modify output value of each node, receive (keyPath, reactiveValue), reactiveValue is a reactive object/array as if, keyPath is an array which catains keys in path
 * @param {function} options.set to modify input value of each node, receive (keyPath, nextValue), nextValue is the given passed value, the return value will be transformed to be reactive object/array as if
 * @param {function} options.dispatch to notify change with keyPath, receive (keypath, next, prev), it will be called after value is set into
 * @param {function} options.writable whether be able to change value, return false to disable writable, default is true
 * @example
 * const some = {
 *   body: {
 *     hand: true,
 *     foot: true,
 *   },
 * }
 * const a = createReactive(some, {
 *   get(keyPath, value) {
 *     if (keyPath.join('.') === 'body.hand') {
 *       return value.toString()
 *     }
 *     else {
 *       return value
 *     }
 *   },
 *   set(keyPath, value) {},
 *   dispatch(keyPath, next, current) {},
 * })
 *
 * a !== some // reactive object !== object
 * a.body !== some.body // reactive object !== object
 * a.body.hand !== some.body.hand // true !== 'true'
 * a.body.foot == some.body.foot // true == true
 *
 * a.body.hand = false // now a.body.hand is 'false', a string
 * some.body.hand === true // no change
 */
export function createReactive(input, options = {}) {
  const { get, set, dispatch, writable } = options

  const create = (input, parents = []) => {
    if (!isObject(input) && !isArray(input)) {
      return input
    }

    let output = null
    if (isObject(input)) {
      output = createObject({ ...input }, parents)
    }
    else {
      output = createArray([...input], parents)
    }

    return output
  }

  const createObject = (obj, parents = []) => {
    const res = {}
    const put = (key, value) => {
      const keyPath = [...parents, key]
      const setValue = (v) => {
        const next = isFunction(set) ? set(keyPath, v) : v
        const coming = create(next, keyPath)
        obj[key] = coming
        return coming
      }
      // initialize the current value at the first time
      const next = setValue(value)
      Object.defineProperty(res, key, {
        get: () => {
          const value = obj[key] // we should not use original value, because it may be changed at any time
          const node = isFunction(get) ? get(keyPath, value) : value
          return node
        },
        set: (v) => {
          const current = res[key]

          if (isFunction(writable) && !writable(keyPath)) {
            return current
          }

          const next = setValue(v)
          if (isFunction(dispatch)) {
            dispatch(keyPath, next, current)
          }
          return next
        },
        enumerable: true,
        configurable: true,
      })
      return next
    }

    each(obj, (value, key) => {
      put(key, value)
    })

    Object.defineProperties(res, {
      $get: {
        value: key => res[key],
      },
      $set: {
        value: (key, value) => {
          const keyPath = [...parents, key]
          const current = res[key]

          const next = put(key, value)

          if (isFunction(dispatch)) {
            dispatch(keyPath, next, current)
          }

          return next
        },
      },
      $del: {
        value: (key) => {
          const keyPath = [...parents, key]
          const current = res[key]

          if (isFunction(writable) && !writable(keyPath)) {
            return current
          }

          delete res[key]

          if (isFunction(dispatch)) {
            dispatch(keyPath, undefined, current)
          }

          return res
        },
      },
    })

    return res
  }

  const createArray = (arr, parents) => {
    const res = []

    // fill items into output array
    const shuffle = (start, end, init = true) => {
      for (let i = start; i <= end; i ++) {
        const item = arr[i]
        const keyPath = [...parents, i]
        const setValue = (v) => {
          const next = isFunction(set) ? set(keyPath, v) : v
          const coming = create(next, keyPath)
          arr[i] = coming
          return coming
        }

        if (init) {
          // initialize items
          setValue(item)
        }

        Object.defineProperty(res, i, {
          get: () => {
            const item = arr[i]
            const node = isFunction(get) ? get(keyPath, item) : item
            return node
          },
          set: (v) => {
            const current = res[i]

            if (isFunction(writable) && !writable(keyPath)) {
              return current
            }

            const next = setValue(v)
            if (isFunction(dispatch)) {
              dispatch(keyPath, next, current)
            }
            return next
          },
          enumerable: true,
          configurable: true,
        })
      }
    }

    // change array prototype methods
    const modify = (fn) => ({
      value: function(...args) {
        if (isFunction(writable) && !writable(parents)) {
          throw new TypeError(fn + ' is not allowed. The array is not writable.')
        }

        // deal with original data
        const p = args.map(item => create(item, parents))
        const before = arr.length
        const o = Array.prototype[fn].apply(arr, p)
        const after = arr.length

        // the methods will change the length of arr
        if (inArray(fn, ['push', 'unshift', 'splice'])) {
          // delete items
          if (before > after) {
            res.length = after
          }
          // insert items
          else if (after > before) {
            shuffle(before - 1, after - 1, false)
          }
        }

        if (isFunction(dispatch)) {
          dispatch(parents, res, res)
        }

        return o
      },
    })

    Object.defineProperties(res, {
      push: modify('push'),
      pop: modify('pop'),
      unshift: modify('unshift'),
      shift: modify('shift'),
      splice: modify('splice'),
      sort: modify('sort'),
      reverse: modify('reverse'),
      fill: modify('fill'),
    })

    shuffle(0, arr.length - 1)

    return res
  }

  const output = create(input)
  return output
}

/**
 * create a proxy object.
 * it will change your original data
 * @param {object|array} input
 * @param {object} options
 * @param {function} options.get to modify output value of each node, receive (keyPath, proxiedValue), proxiedValue is a reactive object/array as if, keyPath is an array which catains keys in path
 * @param {function} options.set to modify input value of each node, receive (keyPath, nextValue), nextValue is the given passed value, the return value will be transformed to be reactive object/array as if
 * @param {function} options.dispatch to notify change with keyPath, receive (keypath, next, prev), it will be called after value is set into
 * @param {function} options.writable whether be able to change value, return false to disable writable, default is true
 * @example
 * const some = {
 *   body: {
 *     hand: true,
 *     foot: true,
 *   },
 * }
 * const a = createProxy(some, {
 *   get(keyPath, value) {
 *     if (keyPath.join('.') === 'body.hand') {
 *       return value.toString()
 *     }
 *     else {
 *       return value
 *     }
 *   },
 *   set(keyPath, value) {},
 *   dispatch(keyPath, next, current) {},
 * })
 *
 * a !== some // proxy object !== object
 * a.body !== some.body // proxy object !== object
 * a.body.hand !== some.body.hand // true !== 'true'
 * a.body.foot == some.body.foot // true == true
 *
 * a.body.hand = false // now a.body.hand is 'false', a string
 * some.body.hand === false // some.body.hand changes to false
 */
export function createProxy(input, options = {}) {
  const { get, set, dispatch, writable } = options

  const create = (input, parents = []) => {
    if (!isObject(input) && !isArray(input)) {
      return input
    }

    let output = null
    if (isObject(input)) {
      output = createObject(input, parents)
    }
    else {
      output = createArray(input, parents)
    }

    return output
  }

  const createObject = (origin, parents = []) => {
    const media = {}
    const proxy = new Proxy(media, {
      get: (target, key, receiver) => {
        // primitive property
        // such as 'a' + obj, and obj[Symbol.toPrimitive](hint) defined
        if (isSymbol(key) && key.description && key.description.indexOf('Symbol.') === 0) {
          return Reflect.get(target, key, receiver)
        }

        const value = Reflect.get(target, key, receiver)

        // here should be noticed
        // a Symbol key will not to into `get` option function
        if (isFunction(get) && !isSymbol(key)) {
          const keyPath = [...parents, key]
          const output = get(keyPath, value)
          return output
        }
        else {
          return value
        }
      },
      set: (target, key, value, receiver) => {
        const keyPath = [...parents, key]

        if (isFunction(writable) && !writable(keyPath)) {
          return false
        }

        let input = value

        if (isFunction(set) && !isSymbol(key)) {
          input = set(keyPath, value)
        }

        // change the original object
        const current = origin[key]
        origin[key] = input

        const next = create(input, keyPath)
        Reflect.set(target, key, next, receiver)

        if (isFunction(dispatch)) {
          dispatch(keyPath, input, current)
        }

        return true
      },
      deleteProperty: (target, key) => {
        const keyPath = [...parents, key]

        if (isFunction(writable) && !writable(keyPath)) {
          return false
        }

        // change the original object
        const current = origin[key]
        delete origin[key]

        Reflect.deleteProperty(target, key)

        if (isFunction(dispatch)) {
          dispatch(keyPath, undefined, current)
        }

        return true
      },
    })
    each(origin, (value, key) => {
      const keyPath = [...parents, key]

      let input = value

      if (isFunction(set) && !isSymbol(key)) {
        input = set(keyPath, value)
      }

      origin[key] = input
      media[key] = create(input, keyPath)
    })
    return proxy
  }

  const createArray = (origin, parents = []) => {
    const media = []
    const proxy = new Proxy(media, {
      get: (target, key, receiver) => {
        // primitive property
        // such as 'a' + obj, and obj[Symbol.toPrimitive](hint) defined
        if (isSymbol(key) && key.description && key.description.indexOf('Symbol.') === 0) {
          return Reflect.get(target, key, receiver)
        }

        // array primitive operation
        if (inArray(key, ['push', 'pop', 'unshift', 'shift', 'splice', 'sort', 'reverse', 'fill'])) {
          return (...args) => {
            if (isFunction(writable) && !writable(parents)) {
              throw new TypeError(key + ' is not allowed. The array is not writable.')
            }

            // change original data
            Array.prototype[key].apply(origin, args)

            const o = Array.prototype[key].apply(media, args.map(item => create(item, parents)))

            if (isFunction(dispatch)) {
              dispatch(parents, origin, origin)
            }

            return o
          }
        }

        const keyPath = [...parents, key]
        const value = Reflect.get(target, key, receiver)

        // here should be noticed
        // a Symbol key will not to into `get` option function
        if (isFunction(get) && !isSymbol(key)) {
          const output = get(keyPath, value)
          return output
        }
        else {
          return value
        }
      },
      set: (target, key, value, receiver) => {
        const keyPath = [...parents, key]

        if (isFunction(writable) && !writable(keyPath)) {
          return false
        }

        // operate like media.length = 0
        if (key === 'length') {
          if (isFunction(writable) && !writable(parents)) {
            throw new TypeError('Length could not be changed. The array is not writable.')
          }

          origin.length = value
          media.length = value

          if (isFunction(dispatch)) {
            dispatch(parents, origin, origin)
          }

          return true
        }

        let input = value

        if (isFunction(set) && !isSymbol(key)) {
          input = set(keyPath, value)
        }

        const current = origin[key]
        origin[key] = input

        const next = create(input, keyPath)
        Reflect.set(target, key, next, receiver)

        if (isFunction(dispatch)) {
          dispatch(keyPath, input, current)
        }

        return true
      },
      deleteProperty: (target, key) => {
        const keyPath = [...parents, key]

        if (isFunction(writable) && !writable(keyPath)) {
          return false
        }

        const current = origin[key]
        delete origin[key]

        Reflect.defineProperty(target, key)

        if (isFunction(dispatch)) {
          dispatch(keyPath, undefined, current)
        }

        return true
      },
    })
    origin.forEach((item, i) => {
      const keyPath = [...parents, i]

      let input = item

      if (isFunction(set)) {
        input = set(keyPath, item)
      }

      origin[i] = input
      media[i] = create(input, keyPath)
    })
    return proxy
  }

  const output = create(input)
  return output
}
