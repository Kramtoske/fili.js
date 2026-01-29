'use strict'

/**
 * Evaluate phase
 */
exports.evaluatePhase = function (res) {
  let xcnt = 0
  let cnt = 0
  const pi = Math.PI
  const tpi = 2 * pi
  const phase = []
  for (cnt = 0; cnt < res.length; cnt++) {
    phase.push(res[cnt].phase)
  }
  res[0].unwrappedPhase = res[0].phase
  res[0].groupDelay = 0
  // TODO: more sophisticated phase unwrapping needed
  for (cnt = 1; cnt < phase.length; cnt++) {
    const diff = phase[cnt] - phase[cnt - 1]
    if (diff > pi) {
      for (xcnt = cnt; xcnt < phase.length; xcnt++) {
        phase[xcnt] -= tpi
      }
    } else if (diff < -pi) {
      for (xcnt = cnt; xcnt < phase.length; xcnt++) {
        phase[xcnt] += tpi
      }
    }
    if (phase[cnt] < 0) {
      res[cnt].unwrappedPhase = -phase[cnt]
    } else {
      res[cnt].unwrappedPhase = phase[cnt]
    }

    res[cnt].phaseDelay = res[cnt].unwrappedPhase / (cnt / res.length)
    res[cnt].groupDelay = (res[cnt].unwrappedPhase - res[cnt - 1].unwrappedPhase) / (pi / res.length)
    if (res[cnt].groupDelay < 0) {
      res[cnt].groupDelay = -res[cnt].groupDelay
    }
  }
  if (res[0].magnitude !== 0) {
    res[0].phaseDelay = res[1].phaseDelay
    res[0].groupDelay = res[1].groupDelay
  } else {
    res[0].phaseDelay = res[2].phaseDelay
    res[0].groupDelay = res[2].groupDelay
    res[1].phaseDelay = res[2].phaseDelay
    res[1].groupDelay = res[2].groupDelay
  }
}

/**
 * Run multi filter
 */
exports.runMultiFilter = function (input, d, doStep, overwrite) {
  let out = []
  if (overwrite) {
    out = input
  }
  let i
  for (i = 0; i < input.length; i++) {
    out[i] = doStep(input[i], d)
  }
  return out
}

exports.runMultiFilterReverse = function (input, d, doStep, overwrite) {
  let out = []
  if (overwrite) {
    out = input
  }
  let i
  for (i = input.length - 1; i >= 0; i--) {
    out[i] = doStep(input[i], d)
  }
  return out
}

const factorial = function (n, a) {
  if (!a) {
    a = 1
  }
  if (n !== Math.floor(n) || a !== Math.floor(a)) {
    return 1
  }
  if (n === 0 || n === 1) {
    return a
  } else {
    return factorial(n - 1, a * n)
  }
}

/**
 * Bessel factors
 */
exports.besselFactors = function (n) {
  const res = []
  for (let k = 0; k < n + 1; k++) {
    const p = factorial(2 * n - k)
    const q = Math.pow(2, (n - k)) * factorial(k) * factorial(n - k)
    res.unshift(Math.floor(p / q))
  }
  return res
}

const fractionToFp = function (fraction, fractionBits) {
  let fpFraction = 0
  for (let cnt = 0; cnt < fractionBits; cnt++) {
    const bitVal = 1 / Math.pow(2, cnt + 1)
    if (fraction > bitVal) {
      fraction -= bitVal
      fpFraction += bitVal
    }
  }
  return fpFraction
}

const numberToFp = function (number, numberBits) {
  return number & Math.pow(2, numberBits)
}

const valueToFp = function (value, numberBits, fractionBits) {
  const number = Math.abs(value)
  const fraction = value - number
  const fpNumber = {
    number: numberToFp(number, numberBits).toString(),
    fraction: fractionToFp(fraction, fractionBits).toString(),
    numberBits,
    fractionBits
  }
  return fpNumber
}

exports.fixedPoint = {
  convert: function (value, numberBits, fractionBits) {
    return valueToFp(value, numberBits, fractionBits)
  },
  add: function (fpVal1, fpVal2) {
  },
  sub: function (fpVal1, fpVal2) {
  },
  mul: function (fpVal1, fpVal2) {
  },
  div: function (fpVal1, fpVal2) {
  }
}

/**
 * Complex
 */
exports.complex = {

  div: function (p, q) {
    const a = p.re
    const b = p.im
    const c = q.re
    const d = q.im
    const n = (c * c + d * d)
    const x = {
      re: (a * c + b * d) / n,
      im: (b * c - a * d) / n
    }
    return x
  },
  mul: function (p, q) {
    const a = p.re
    const b = p.im
    const c = q.re
    const d = q.im
    const x = {
      re: (a * c - b * d),
      im: (a + b) * (c + d) - a * c - b * d
    }
    return x
  },
  add: function (p, q) {
    const x = {
      re: p.re + q.re,
      im: p.im + q.im
    }
    return x
  },
  sub: function (p, q) {
    const x = {
      re: p.re - q.re,
      im: p.im - q.im
    }
    return x
  },
  phase: function (n) {
    return Math.atan2(n.im, n.re)
  },
  magnitude: function (n) {
    return Math.sqrt(n.re * n.re + n.im * n.im)
  }
}
