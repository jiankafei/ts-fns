/**
 * @module number
 */


import { formatStringBy, padRight, padLeft } from './string.js'
import { isString, isNumeric, isNumber, isNaN } from './is.js'
import { createSafeExp } from './regexp.js'

export function numerify(num) {
	if (isString(num)) {
		if (!isNumeric(num)) {
			return ''
		}
		let value = clearNumberZero(num)
		return value
	}
	else if (isNumber(num)) {
		let value = num.toString()
		if (value.indexOf('e')) {
			return enumerify(value)
		}
		else {
			return value
		}
	}
	else {
		return ''
	}
}

export function enumerify(input) {
  let num = parseFloat(input);
  if (isNaN(num)) {
    return ''
  }

  if (!input && input !== 0) {
    return ''
  }

  let str = input.toString()

  if (str.indexOf('e') === -1) {
    return str
  }

  let [base, exp] = str.split('e')
  let count = Number.parseInt(exp, 10)
  if (count >= 0) {
    let arr = base.split('')
    for (let i = 0; i < count; i ++) {
      let index = arr.indexOf('.')
      let next = index === arr.length - 1 ? '0' : arr[index + 1]
      arr[index] = next;
      arr[index + 1] = '.'
    }
    if (arr[arr.length - 1] === '.') {
      arr.pop()
    }
    let result = arr.join('')
    return result
  }
  else {
    let arr = base.split('')
    let rarr = arr.reverse()
    for (let i = count; i < 0; i ++) {
      let index = rarr.indexOf('.')
      let next = index === rarr.length - 1 ? '0' : rarr[index + 1]
      rarr[index] = next
      rarr[index + 1] = '.'
    }
    let rrarr = rarr.reverse()
    if (rrarr[0] === '.') {
      rrarr.unshift('0')
    }
    let result = rrarr.join('')
    return result
  }
}

export function clearNumberZero(input) {
  input = input.toString()
  var [ integerPart, decimalPart = '' ] = input.split('.')
  var isNegative = false
  if (integerPart.indexOf('-') === 0) {
    isNegative = true
    integerPart = integerPart.substring(1)
  }
  integerPart = integerPart.replace(/^0+/, '')
  decimalPart = decimalPart.replace(/0+$/, '')
  var value = (isNegative && (integerPart || decimalPart) ? '-' : '') + (integerPart ? integerPart : '0') + (decimalPart ? '.' + decimalPart : '')
  return value
}

export function plusby(a, b) {
	a = numerify(a)
	b = numerify(b)

	if (a === '0') {
		return b
	}
	else if (b === '0') {
		return a
	}

	var [ ia, da = '0' ] = a.split('.')
	var [ ib, db = '0' ] = b.split('.')

	// 是否为负数
	var na = false
	var nb = false
	if (ia.indexOf('-') === 0) {
		ia = ia.substring(1)
		na = true
	}
	if (ib.indexOf('-') === 0) {
		ib = ib.substring(1)
		nb = true
	}

	// 一正一负相当于相减
	if (na && !nb) {
		return minusby(b, a.substring(1))
	}
	if (nb && !na) {
		return minusby(a, b.substring(1))
	}

	// 创建一个整数相加函数
	const plus = (x, y) => {
		let xr = x.split('').reverse()
		let yr = y.split('').reverse()
		let len = Math.max(xr.length, yr.length)
		let items = []
		for (let i = 0; i < len; i ++) {
			let xv = xr[i] || '0'
			let yv = yr[i] || '0'
			items[i] = ((+xv) + (+yv)) + ''
		}

		let sum = items.reduce((sum, item, index) => {
			let sumlen = sum.length
			// 如果之前相加进了一位
			if (sumlen > index) {
				let borrow = sum.substring(0, 1)
				let placed = sum.substring(1)
				let next = (+borrow + +item) + ''
				return next + placed
			}
			else {
				return item + sum
			}
		}, '')
		return sum
	}

	// 补齐位数用以相加
	const dalen = da.length
	const dblen = db.length
	const dlen = Math.max(dalen, dblen)
	if (dalen < dlen) {
		da = padRight(da, dlen, '0')
	}
	if (dblen < dlen) {
		db = padRight(db, dlen, '0')
	}

	const ta = ia + da
	const tb = ib + db

	var sum = plus(ta, tb)

	// 还原小数位数
	var sumr = sum.split('')
	var sumlen = sumr.length
	var index = sumlen - dlen
	sumr.splice(index, 0, '.')
	sum = sumr.join('')

	sum = clearNumberZero(sum)
	sum = sum === '' ? '0' : sum

	// 都是负数
	if (sum !== '0' && na && nb) {
		sum = '-' + sum
	}

	return sum
}

export function minusby(a, b) {
	a = numerify(a)
	b = numerify(b)

	if (b === '0') {
		return a
	}
	else if (a === '0') {
		if (b.indexOf('-') === 0) {
			return b.substring(1)
		}
		else {
			return '-' + b
		}
	}
	else if (a === b) {
		return '0'
	}

	var [ ia, da = '0' ] = a.split('.')
	var [ ib, db = '0' ] = b.split('.')

	// 是否为负数
	var na = false
	var nb = false
	if (ia.indexOf('-') === 0) {
		ia = ia.substring(1)
		na = true
	}
	if (ib.indexOf('-') === 0) {
		ib = ib.substring(1)
		nb = true
	}

	// 一正一负相当于相加
	if (na && !nb) {
		return plusby(a, '-' + b)
	}
	if (nb && !na) {
		return plusby(a, b.substring(1))
	}

	// 当b大于a的时候，先反过来计算，然后再取反
	if (compare(b, a) > 0) {
		let diff = minusby(b, a)
		return '-' + diff
	}

	const minus = (x, y) => {
		let xr = x.split('').reverse()
		let yr = y.split('').reverse()
		let len = Math.max(xr.length, yr.length)
		let items = []
		for (let i = 0; i < len; i ++) {
			let xv = xr[i] || '0'
			let yv = yr[i] || '0'
			items[i] = {
				xv,
				yv,
			}
		}

		let isBorrowed = false
		let diff = items.reduce((diff, item, index) => {
			let { xv, yv } = item

			xv = +xv
			yv = +yv

			// 如果被借位，则一开始自己就要减1
			if (isBorrowed) {
				xv --
			}

			// 向前借位
			if (xv < yv) {
				isBorrowed = true
				xv += 10
			}
			else {
				isBorrowed = false
			}

			let v = xv - yv
			diff = v + diff

			return diff
		}, '')

		return diff
	}

	// 补齐位数用以相减
	const dalen = da.length
	const dblen = db.length
	const dlen = Math.max(dalen, dblen)
	if (dalen < dlen) {
		da = padRight(da, dlen, '0')
	}
	if (dblen < dlen) {
		db = padRight(db, dlen, '0')
	}

	const ta = ia + da
	const tb = ib + db

	var diff = minus(ta, tb)

	// 还原小数位数
	var diffr = diff.split('')
	var difflen = diffr.length
	var index = difflen - dlen
	diffr.splice(index, 0, '.')
	diff = diffr.join('')

	diff = clearNumberZero(diff)
	diff = diff === '' ? '0' : diff

	return diff
}

export function multiplyby(a, b) {
	a = numerify(a)
	b = numerify(b)

	// 0值快速返回
	if (a === '0' || b === '0') {
		return '0'
	}
	else if (a === '1') {
		return b
	}
	else if (b === '1') {
		return a
	}
	else if (a === '-1') {
		if (b.indexOf('-') === 0) {
			return b.substring(1)
		}
		else {
			return '-' + b
		}
	}
	else if (b === '-1') {
		if (a.indexOf('-') === 0) {
			return a.substring(1)
		}
		else {
			return '-' + a
		}
	}
	// 特殊处理那种整除100000的
	else if (/^10+/.test(b)) {
		let wei = Math.log10(b)
		let value = numerify(a)
		let [ integerPart, decimalPart = '' ] = value.split('.')
		let decimalLen = decimalPart.length
		// 移动小数点位置
		if (decimalLen <= wei) {
			value = integerPart + padRight(decimalPart, wei, '0')
		}
		else {
			value = integerPart + decimalPart.substring(0, wei) + '.' + decimalPart.substring(wei)
		}
		value = clearNumberZero(value)
		return value
	}

	/**
	 * 大数乘法
	 * 思路：逐位相乘，不算进位；最后算进位并拼接字符串
	 * @param {number} a 被乘数
	 * @param {number} b 乘数
	 */
	const multiply = (a, b) => {
		const result = []
		const aArr = a.toString().split('').map(t => parseInt(t))
		const bArr = b.toString().split('').map(t => parseInt(t))
		const aLen = aArr.length
		const bLen = bArr.length

		// 逐位相乘，不算进位，与计算方向无关
		for (let bIndex = bLen-1; bIndex >= 0; bIndex--) {
			for (let aIndex = aLen-1; aIndex >= 0; aIndex--) {
				let index = bIndex + aIndex
				if (!result[index]) {
					result[index] = 0
				}
				result[index] += bArr[bIndex] * aArr[aIndex]
			}
		}

		// 因为是从左到右的计算顺序，所以进位要反向
		// （也方便最高位进位时，数组可扩）。
		result.reverse()
		// 最高位可能会进位，所以每次循环重新计算length。
		for (let i = 0; i < result.length; i ++) {
			if (!result[i]) {
				result[i] = 0
			}

			let more = parseInt(result[i] / 10)
			if (more > 0) {
				if (!result[i + 1]) {
					result[i + 1] = 0
				}
				result[i + 1] += more
			}
			result[i] = result[i] % 10
		}
		result.reverse()

		return result.join('')
	}

	var [ ia, da = '0' ] = a.split('.')
	var [ ib, db = '0' ] = b.split('.')

	// 是否为负数
	var na = false
	var nb = false
	if (ia.indexOf('-') === 0) {
		ia = ia.substring(1)
		na = true
	}
	if (ib.indexOf('-') === 0) {
		ib = ib.substring(1)
		nb = true
	}

	// 负负为正
	var isNegative = false
	if ((na && !nb) || (!na && nb)) {
		isNegative = true
	}

	var iProd = multiply(ia, ib)
	var dProd = multiply(da, db)

	dProd = padLeft(dProd, da.length + db.length, '0') // 补全小数位数

	var value = iProd + '.' + dProd
	value = clearNumberZero(value)
	value = (isNegative ? '-' : '') + value
	value = value === '' ? '0' : value

	return value
}

export function divideby(a, b, decimal) {
  if (isUndefined(decimal)) {
    decimal = divideby.InfiniteDecimalLength
  }

  a = numerify(a)
  b = numerify(b)

  // 除数不能为0
  if (b === '0') {
    throw new Error('除数不能为0')
  }

  if (a === '0') {
    return '0'
  }
  else if (b === '1') {
    return a
  }
  else if (a === b) {
    return '1'
  }
  // 特殊处理那种整除100000的
  else if (/^10+/.test(b)) {
    let wei = Math.log10(b)
    let value = numerify(a)
    let [ integerPart, decimalPart = '' ] = value.split('.')
    let integerLen = integerPart.length
    // 移动小数点位置
    if (integerLen <= wei) {
      value = '0.' + padLeft(integerPart, wei, '0') + decimalPart
    }
    else {
      let pos = integerLen - wei
      let left = integerPart.substring(0, pos)
      let right = integerPart.substring(pos)
      value = left + '.' + right + decimalPart
    }
    value = clearNumberZero(value)
    return value
  }

  var [ ib, db = '' ] = b.split('.')

  // 除数被除数都同时扩大，使除数成为整数
  if (db.length) {
    let len = db.length
    let pow = Math.pow(10, len)
    a = multiplyby(a, pow)
    b = multiplyby(b, pow)
  }

  var [ ia, da = '' ] = a.split('.')

  // 是否为负数
  var na = false
  var nb = false
  if (ia.indexOf('-') === 0) {
    ia = ia.substring(1)
    na = true
  }
  if (b.indexOf('-') === 0) {
    b = b.substring(1)
    nb = true
  }

  // 两个正整数相除
  const divide = (x, y) => {
    const uselen = y.length
    const result = []

    // 取出一组
    var waitforcompare = x.substr(0, uselen)
    var waittouse = x.substring(uselen)

    var stillhave = waitforcompare // 减去y之后剩下的值
    var inrange = 0

    do {
      let c
      while (c = compare(stillhave, y) >= 0) {
        if (c > 0) {
          inrange ++
          stillhave = minusby(stillhave, y) // 减去1次
        }
        else if (c === 0) {
          inrange ++
          stillhave = ''
          break
        }
      }

      let stillhavelen = stillhave.length
      // 从x的头部取出需要的部分组成新的waitforcompare
      let nextlen = uselen - stillhavelen
      nextlen = nextlen > 0 ? nextlen : 1
      waitforcompare = (stillhave === '0' ? '' : stillhave) + waittouse.substr(0, nextlen)
      waittouse = waittouse.substring(nextlen)

      result.push(inrange)
      stillhave = waitforcompare // 当stillhave=''时，会跳出循环
      inrange = 0

      // 末尾为 0，且整除的情况下，循环会被破坏，这种情况要特殊处理，直接将剩余的 00 添加到商的末尾即可
      if (waittouse === '' && /^0+$/.test(waitforcompare)) {
        result.push(waitforcompare)
        stillhave = ''
        break
      }
    } while (compare(stillhave, y) >= 0)

    var remainder = stillhave || '0'
    var quotient = result.join('')

    remainder = clearNumberZero(remainder)
    quotient = clearNumberZero(quotient)

    return { remainder, quotient }
  }

  var dvi = divide(ia, b) // 整数部分得到的结果
  var { remainder, quotient } = dvi
  var value = quotient

  if (da) {
    remainder = remainder === '0' ? da : remainder + da // 连接小数部分，准备计算小数部分的商
  }
  else {
    remainder = remainder + '0'
  }

  if (remainder && remainder !== '0') {
    var result = ''
    var nextto = remainder
    // console.log(value, nextto, b, /[1-9]/.test(nextto), divide(nextto, b))
    while (/[1-9]/.test(nextto)) {
      let dvd = divide(nextto, b)
      let { remainder, quotient } = dvd
      result += quotient

      if (remainder === '0') {
        break
      }

      nextto = remainder + '0'

      // 当小数位数超出规定的位数时，跳出
      if (result.length > decimal) {
        break
      }
    }
    value = quotient + '.' + result
  }

  value = clearNumberZero(value)

  if ((na && !nb) || (!na && nb)) {
    value = '-' + value
  }

  return value
}
divideby.InfiniteDecimalLength = 15 // 无限小数保留位数

export function compare(a, b) {
	a = numerify(a)
	b = numerify(b)

	var [ ia, da = '' ] = a.split('.')
	var [ ib, db = '' ] = b.split('.')

	// n, m 都是正整数
	const compare2 = (n, m) => {
		if (n.length > m.length) {
			return 1
		}
		else if (n.length < m.length) {
			return -1
		}
		else {
			for (let i = 0, len = n.length; i < len; i ++) {
				let nv = n.charAt(i)
				let mv = m.charAt(i)
				if (+nv > +mv) {
					return 1
				}
				else if (+nv < +mv) {
					return -1
				}
			}
			return 0
		}
	}

	// x, y都是整数，但可正可负
	const compare = (x, y) => {
		let nx = x.indexOf('-') === 0
		let ny = y.indexOf('-') === 0

		// x > 0 > y
		if (!nx && ny) {
			return 1
		}
		// y > 0 > x
		else if (nx && !ny) {
			return -1
		}
		// x, y < 0
		else if (nx && ny) {
			x = x.substring(1)
			y = y.substring(1)
			let result = compare2(x, y)
			return -result
		}
		// x, y > 0
		else if (!nx && !ny) {
			return compare2(x, y)
		}
	}

	const ci = compare(ia, ib)
	if (ci) {
		return ci
	}

	// 小数部分长度补全相同长度来比较
	const dalen = da.length
	const dblen = db.length
	const dlen = Math.max(dalen, dblen)
	if (dalen < dlen) {
		da = padRight(da, dlen, '0')
	}
	if (dblen < dlen) {
		db = padRight(db, dlen, '0')
	}
	const cd = compare(da, db)
	if (cd) {
		return cd
	}

	return 0
}

export function calculate(exp, decimal) {
  const contains = (str, items) => {
    for (let i = 0, len = items.length; i < len; i ++) {
      let item = items[i]
      if (str.indexOf(item) > -1) {
        return true
      }
    }
    return false
  }

  if (!/^[\(\-]?[0-9]+[0-9\+\-\*\/\(\)]*[0-9\)]$/.test(exp)) {
    throw new Error('算式中包含不允许的内容')
  }
  if (contains(exp, ['---', '++', '**', '//'])) { // -- 是被允许了，例如 -2--3 这样的算式是合法的，实际上，也只有 - 可以被跟在另外一个符合后面
    throw new Error('算式中包含重复的运算符')
  }
  if (contains(exp, ['-*', '-/', '+*', '+/'])) {
    throw new Error('酸式中包含非法的连续运算符')
  }
  if (exp.indexOf(')(') > -1) {
    throw new Error('算式中不允许包含连续括号')
  }
  if (exp.indexOf('()') > -1) {
    throw new Error('算式中不允许包含空括号')
  }
  if (/\)[0-9]/.test(exp)) {
    throw new Error('算式中，括号后面不能直接跟数字')
  }
  if (/[0-9]\(/.test(exp)) {
    throw new Error('算式中，括号不能直接跟在数字后面')
  }

  const parse = (exp) => {
    let inGroup = 0 // 数字代表括号层级，括号里面还能套括号
    let exparr = []
    let expstr = ''
    let groups = []
    let groupstr = ''
    for (let i = 0, len = exp.length; i < len; i ++) {
      let char = exp.charAt(i)
      if (char === '(') {
        // 子括号，在外面的括号内部，只需要将字符串原始连接给该组即可，放到后面处理
        if (inGroup) {
          groupstr += char
        }
        else {
          if (expstr) {
            exparr.push(expstr)
            expstr = ''
          }
        }
        inGroup ++
      }
      else if (char === ')') {
        if (!inGroup) {
          throw new Error('算式不正确，非法反括号，位置：' + groupstr + ')')
        }

        // 顶层括号结束
        if (inGroup === 1) {
          if (groupstr) {
            let index = groups.length
            exparr.push(index)
            groups.push(groupstr)
            groupstr = ''
          }
        }
        else {
          groupstr += char
        }
        inGroup --
      }
      else if (inGroup) {
        groupstr += char
      }
      else {
        if (/[\+\-\*\/]/.test(char)) {
          if (expstr) {
            exparr.push(expstr)
          }
          expstr = ''
          exparr.push(char)
        }
        else {
          expstr += char
        }
      }
    }

    if (inGroup) {
      throw new Error('括号没有正确关闭，请检查算式')
    }

    // 最后一个数
    if (expstr) {
      exparr.push(expstr)
    }

    // 对于运算中的负数，直接将它组合到后面一位的数字中去
    const exparr2 = []
    for (let i = 0, len = exparr.length; i < len; i ++) {
      const current = exparr[i]
      const prev = exparr[i - 1]
      const next = exparr[i + 1]
      // 遇到减号
      if (current === '-') {
        // 负号前面是符号，表示当前数字可能是负数
        if (i === 0 || inArray(prev, ['*', '/', '+', '-'])) {
          // 在一个负值前面添加负号，表示正数
          if (next === '-') {
            i ++
            continue
          }
          // 正数前面肯定就是负数了
          else if (next === '+') {
            let nextnext = exparr[i + 2]
            let text = '-' + nextnext
            exparr2.push(text)
            i += 2
          }
          // 后面是数
          else {
            let text = '-' + next
            exparr2.push(text)
            i ++
          }
        }
        else {
          exparr2.push(current)
        }
      }
      else {
        exparr2.push(current)
      }
    }

    // 解析前面创建的括号组，并将该处用一个数组替换
    const expsrc = []
    exparr2.forEach((item, i) => {
      if (isNumber(item)) {
        item = groups[item]
        item = parse(item)
      }
      expsrc.push(item)
    })

    var expast = []

    // 将乘除法运算进行提升
    if (contains(exp, ['+', '-']) && contains(exp, ['*', '/'])) {
      let combine = []
      let started = false
      for (let i = 0; i < expsrc.length; i ++) {
        let current = expsrc[i]
        // 乘除法开始
        if (!started && (current === '*' || current === '/')) {
          let prev = expast.pop()
          combine.push(prev)
          combine.push(current)
          started = true
        }
        // 乘除法结束
        // 减号位置需要注意，因为减号可能存在于乘除法中间
        else if (started) {
          if (current === '+' || (!inArray(combine[combine.length - 1], ['*', '/']) && current === '-')) {
            expast.push(combine)
            expast.push(current)
            started = false
            combine = []
          }
          else if (i === (expsrc.length - 1)) {
            combine.push(current)
            expast.push(combine)
            started = false
            combine = []
          }
          else {
            combine.push(current)
          }
        }
        else {
          expast.push(current)
        }
      }
    }
    // 在没有混合运算的情况下，直接返回即可
    else {
      expast = expsrc
    }

    // expres是一个多维数组，到底多少层未知，主要看括号分组情况
    // 这个数组的最顶层是整个算式的解析结果，模式如下：
    // [ '1', '+', '2' ]
    // [ '1', '+', [ '2', '*', '3' ], '+', [ '4', '/', '2' ] ]
    // 内部的数组代表一个小括号，会在运算时先执行
    return expast
  }

  // 运算元，从左往右依次进行计算
  const execute = (expast) => {
    // 先计算出优先级高的部分
    const exparr = []
    expast.forEach((item) => {
      if (isArray(item)) {
        item = execute(item)
      }
      exparr.push(item)
    })

    // 由于 expast 中进行了分组，因此，同一个级别的运算只会以同一级别运算符为集合，因此，不需要考虑加减和乘除同时混合的情况，只需要对乘除进行处理即可
    // 调整顺序，如果遇到乘除法连续的情况，先乘法，再除法，这样可以减少除不尽带来的误差，例如 10/3*3 调整为 10*3/3 则不会出现除不尽
    var expres = []
    const leftres = []
    const rightres = []
    for (let i = 0, len = exparr.length; i < len; i ++) {
      const current = exparr[i]
      const next = exparr[i + 1]
      if (current === '*') {
        leftres.push(current)
        leftres.push(next)
        i ++
      }
      else if (current === '/') {
        rightres.push(current)
        rightres.push(next)
        i ++
      }
      else {
        expres.push(current)
      }
    }
    expres = expres.concat(leftres).concat(rightres)

    // 开始执行连续计算逻辑
    let result = ''
    for (let i = 0, len = expres.length; i < len; i ++) {
      let current = expres[i]
      if (i === 0) {
        result = current === '-' ? '0' : current
      }
      if (/[\+\-\*\/]/.test(current)) {
        let next = expres[i + 1]
        if (current === '+') {
          result = plusby(result, next)
        }
        else if (current === '-') {
          result = minusby(result, next)
        }
        else if (current === '*') {
          result = multiplyby(result, next)
        }
        else if (current === '/') {
          result = divideby(result, next, decimal)
        }
      }
    }

    return result
  }

  const expast = parse(exp)
  const result = execute(expast)
  return result
}

export function formatNumberByThousands(input, formatdecimal = false) {
  return formatNumberBy(input, ',', 3, formatdecimal);
}

export function fixNumber(input, decimal = 2, pad = false, floor = false) {
  let num = parseFloat(input)
  if (isNaN(num)) {
    return ''
  }

  let value = numerify(input)
  let [ integerPart, decimalPart = '' ] = value.split('.')

  const plusOneToTail = (dnum) => {
    let [ integerPart, decimalPart ] = dnum.split('.')
    let dlen = decimalPart.length
    let one = '0.' + padLeft('1', dlen, '0')
    let value = plusby(dnum, one)
    return value
  }

  if (decimal === 0 && floor) {
    if (decimalPart && num < 0) {
      integerPart = minusby(integerPart, '1')
    }
    value = integerPart
  }
  else if (decimal === 0) {
    if (decimalPart && +('0.' + decimalPart) >= 0.5) {
      if (num >= 0) {
        integerPart = plusby(integerPart, '1')
      }
      else {
        integerPart = minusby(integerPart, '1')
      }
    }
    value = integerPart
  }
  else if (decimal > 0 && floor) {
    let isNegative = num < 0
    if (decimalPart) {
      if (isNegative) {
        let usePart = decimalPart.substr(0, decimal)
        let dropPart = decimalPart.substring(decimal)

        usePart = '0.' + usePart

        if (dropPart) {
          usePart = plusOneToTail(usePart)
        }

        value = minusby(integerPart, usePart)
      }
      else {
        value = integerPart + '.' + decimalPart.substr(0, decimal)
      }
    }
    else {
      value = integerPart
    }
  }
  else if (decimal > 0) {
    value = integerPart
    if (decimalPart) {
      let usePart = decimalPart.substr(0, decimal)
      let dropPart = decimalPart.substr(decimal, 1)

      usePart = '0.' + usePart

      if (+dropPart >= 5) {
        usePart = plusOneToTail(usePart)
      }

      let isNegative = num < 0
      if (isNegative) {
        value = minusby(integerPart, usePart)
      }
      else {
        value = plusby(integerPart, usePart)
      }
    }
  }

  value = clearNumberZero(value)

  if (pad) {
    let [ integerPart, decimalPart = '' ] = value.split('.')
    if ((decimalPart && decimalPart.length < decimal) || !decimalPart) {
      decimalPart = padRight(decimalPart || '', decimal, '0')
      value = integerPart + '.' + decimalPart
    }
  }

  return value
}

export function fixNumberToMillion(input, decimal, pad, floor) {
  let num = parseFloat(input);
  if (isNaN(num)) {
    return '';
  }

  let value = numerify(input)
  value = divideby(value, 1000000)

  return fixNumber(value, decimal, pad, floor)
}

export function fixNumberToBillion(input, decimal, pad, floor) {
  let num = parseFloat(input);
  if (isNaN(num)) {
    return '';
  }

  let value = numerify(input)
  value = divideby(value, 1000000000)

  return fixNumber(value, decimal, pad, floor)
}

export function formatNumberBy(input, separator, count, formatdecimal = false) {
  if (!input) {
    return '';
  }

  let num = input.toString();

  if (!/^\-{0,1}[0-9]+(\.{0,1}[0-9]+){0,1}$/.test(num)) {
    return '';
  }

  let blocks = num.split(/\-|\./);
  let isNegative = num.charAt(0) === '-';
  let integer;
  let decimal;

  if (isNegative) {
    integer = blocks[1];
    decimal = blocks[2] || '';
  }
  else {
    integer = blocks[0];
    decimal = blocks[1] || '';
  }

  integer = formatStringBy(integer, separator, count, true);
  if (formatdecimal && decimal) {
    decimal = formatStringBy(decimal, separator, count);
  }

  let result = '';
  if (isNegative) {
    result += '-';
  }

  result += integer;

  if (decimal) {
    result += '.' + decimal;
  }

  return result;
}

export function clearNumberWith(input, separator = ',') {
  const exp = createSafeExp(separator)
  const reg = new RegExp(exp, 'g')
  return input.replace(reg, '');
}

export function formatNumber(input, decimal, pad, floor) {
  let value = fixNumber(input, decimal, pad, floor)
  let res = formatNumberByThousands(value)
  return res || ''
}

export function formatNumberByMillion(input, decimal, pad, floor) {
  let num = parseFloat(input);
  if (isNaN(num)) {
    return '';
  }

  let should = num > 1000000 || num < -1000000;

  let value = should ? fixNumberToMillion(input, decimal, pad, floor) : fixNumber(input, decimal, pad, floor);
  let res = formatNumberByThousands(value);

  if (!res) {
    return '';
  }

  if (should) {
    return res + ' mn';
  }

  return res;
}

export function formatNumberByBillion(input, decimal, pad, floor) {
  let num = parseFloat(input);
  if (isNaN(num)) {
    return '';
  }

  let should = num > 1000000000 || num < -1000000000;

  let value = should ? fixNumberToBillion(input, decimal, pad, floor) : fixNumber(input, decimal, pad, floor);
  let res = formatNumberByThousands(value);

  if (!res) {
    return '';
  }

  if (should) {
    return res + ' bn';
  }

  return res;
}

export function formatNumberByMoney(input, decimal, pad, floor) {
  let num = parseFloat(input);
  if (isNaN(num)) {
    return '';
  }

  if (num < -1000000000 || num > 1000000000) {
    return formatNumberByBillion(input, decimal, pad, floor)
  }
  else if (num < -1000000 || num > 1000000) {
    return formatNumberByMillion(input, decimal, pad, floor)
  }
  else {
    return formatNumber(input, decimal, pad, floor)
  }
}
