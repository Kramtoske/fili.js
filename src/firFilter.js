'use strict'

const {
  runMultiFilter,
  runMultiFilterReverse,
  complex,
  evaluatePhase
} = require('./utils')

/**
 * Fir filter
 */
const FirFilter = function (filter) {
  // note: coefficients are equal to input response
  const f = filter
  const b = []
  let cnt = 0
  for (cnt = 0; cnt < f.length; cnt++) {
    b[cnt] = {
      re: f[cnt],
      im: 0
    }
  }

  const initZero = function (cnt) {
    const r = []
    let i
    for (i = 0; i < cnt; i++) {
      r.push(0)
    }
    return {
      buf: r,
      pointer: 0
    }
  }

  let z = initZero(f.length - 1)

  const doStep = function (input, d) {
    d.buf[d.pointer] = input
    let out = 0
    for (cnt = 0; cnt < d.buf.length; cnt++) {
      out += (f[cnt] * d.buf[(d.pointer + cnt) % d.buf.length])
    }
    d.pointer = (d.pointer + 1) % (d.buf.length)
    return out
  }

  const calcInputResponse = function (input) {
    const tempF = initZero(f.length - 1)
    return runMultiFilter(input, tempF, doStep)
  }

  const calcResponse = function (params) {
    const Fs = params.Fs
    const Fr = params.Fr
    // z = exp(j*omega*pi) = cos(omega*pi) + j*sin(omega*pi)
    // z^-1 = exp(-j*omega*pi)
    // omega is between 0 and 1. 1 is the Nyquist frequency.
    const theta = -Math.PI * (Fr / Fs) * 2
    let h = {
      re: 0,
      im: 0
    }
    for (let i = 0; i < f.length - 1; i++) {
      h = complex.add(h, complex.mul(b[i], {
        re: Math.cos(theta * i),
        im: Math.sin(theta * i)
      }))
    }
    const m = complex.magnitude(h)
    const res = {
      magnitude: m,
      phase: complex.phase(h),
      dBmagnitude: 20 * Math.log(m) * Math.LOG10E
    }
    return res
  }

  const self = {
    responsePoint: function (params) {
      return calcResponse(params)
    },
    response: function (resolution) {
      resolution = resolution || 100
      const res = []
      let cnt = 0
      const r = resolution * 2
      for (cnt = 0; cnt < resolution; cnt++) {
        res[cnt] = calcResponse({
          Fs: r,
          Fr: cnt
        })
      }
      evaluatePhase(res)
      return res
    },
    simulate: function (input) {
      return calcInputResponse(input)
    },
    singleStep: function (input) {
      return doStep(input, z)
    },
    multiStep: function (input, overwrite) {
      return runMultiFilter(input, z, doStep, overwrite)
    },
    filtfilt: function (input, overwrite) {
      return runMultiFilterReverse(runMultiFilter(
        input, z, doStep, overwrite), z, doStep, true)
    },
    reinit: function () {
      z = initZero(f.length - 1)
    }
  }
  return self
}

module.exports = FirFilter
