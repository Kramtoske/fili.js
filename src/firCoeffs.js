'use strict'

const FirCoeffs = function () {
  // Kaiser windowd filters
  // desired attenuation can be defined
  // better than windowd sinc filters
  const calcKImpulseResponse = function (params) {
    const Fs = params.Fs
    const Fa = params.Fa
    const Fb = params.Fb
    let o = params.order || 51
    const alpha = params.Att || 100
    const ino = function (val) {
      let d = 0
      let ds = 1
      let s = 1
      while (ds > s * 1e-6) {
        d += 2
        ds *= val * val / (d * d)
        s += ds
      }
      return s
    }

    if (o / 2 - Math.floor(o / 2) === 0) {
      o++
    }
    const Np = (o - 1) / 2
    const A = []
    let beta = 0
    let cnt = 0
    const ret = []

    A[0] = 2 * (Fb - Fa) / Fs
    for (cnt = 1; cnt <= Np; cnt++) {
      A[cnt] = (Math.sin(2 * cnt * Math.PI * Fb / Fs) - Math.sin(2 * cnt * Math.PI * Fa / Fs)) / (cnt * Math.PI)
    }
    // empirical coefficients
    if (alpha < 21) {
      beta = 0
    } else if (alpha > 50) {
      beta = 0.1102 * (alpha - 8.7)
    } else {
      beta = 0.5842 * Math.pow((alpha - 21), 0.4) + 0.07886 * (alpha - 21)
    }

    const inoBeta = ino(beta)
    for (cnt = 0; cnt <= Np; cnt++) {
      ret[Np + cnt] = A[cnt] * ino(beta * Math.sqrt(1 - (cnt * cnt / (Np * Np)))) / inoBeta
    }
    for (cnt = 0; cnt < Np; cnt++) {
      ret[cnt] = ret[o - 1 - cnt]
    }
    return ret
  }

  // note: coefficients are equal to impulse response
  // windowd sinc filter
  const calcImpulseResponse = function (params) {
    const Fs = params.Fs
    const Fc = params.Fc
    const o = params.order
    const omega = 2 * Math.PI * Fc / Fs
    let cnt = 0
    let dc = 0
    const ret = []
    // sinc function is considered to be
    // the ideal impulse response
    // do an idft and use Hamming window afterwards
    for (cnt = 0; cnt <= o; cnt++) {
      if (cnt - o / 2 === 0) {
        ret[cnt] = omega
      } else {
        ret[cnt] = Math.sin(omega * (cnt - o / 2)) / (cnt - o / 2)
        // Hamming window
        ret[cnt] *= (0.54 - 0.46 * Math.cos(2 * Math.PI * cnt / o))
      }
      dc = dc + ret[cnt]
    }
    // normalize
    for (cnt = 0; cnt <= o; cnt++) {
      ret[cnt] /= dc
    }
    return ret
  }
  // invert for highpass from lowpass
  const invert = function (h) {
    let cnt
    for (cnt = 0; cnt < h.length; cnt++) {
      h[cnt] = -h[cnt]
    }
    h[(h.length - 1) / 2]++
    return h
  }
  const bs = function (params) {
    const lp = calcImpulseResponse({
      order: params.order,
      Fs: params.Fs,
      Fc: params.F2
    })
    const hp = invert(calcImpulseResponse({
      order: params.order,
      Fs: params.Fs,
      Fc: params.F1
    }))
    const out = []
    for (let i = 0; i < lp.length; i++) {
      out.push(lp[i] + hp[i])
    }
    return out
  }
  const self = {
    lowpass: function (params) {
      return calcImpulseResponse(params)
    },
    highpass: function (params) {
      return invert(calcImpulseResponse(params))
    },
    bandstop: function (params) {
      return bs(params)
    },
    bandpass: function (params) {
      return invert(bs(params))
    },
    kbFilter: function (params) {
      return calcKImpulseResponse(params)
    },
    available: function () {
      return ['lowpass', 'highpass', 'bandstop', 'bandpass', 'kbFilter']
    }
  }
  return self
}

module.exports = FirCoeffs
