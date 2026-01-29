'use strict'

/**
 * Test filter
 */
const TestFilter = function (filter) {
  const f = filter

  const simData = []
  let cnt

  const randomValues = function (params) {
    for (cnt = 0; cnt < params.steps; cnt++) {
      simData.push(f.singleStep(((Math.random() - 0.5) * params.pp) + params.offset))
    }
  }

  const stepValues = function (params) {
    const max = params.offset + params.pp
    const min = params.offset - params.pp
    for (cnt = 0; cnt < params.steps; cnt++) {
      if ((cnt % 200) < 100) {
        simData.push(f.singleStep(max))
      } else {
        simData.push(f.singleStep(min))
      }
    }
  }

  const impulseValues = function (params) {
    const max = params.offset + params.pp
    const min = params.offset - params.pp
    for (cnt = 0; cnt < params.steps; cnt++) {
      if (cnt % 100 === 0) {
        simData.push(f.singleStep(max))
      } else {
        simData.push(f.singleStep(min))
      }
    }
  }

  const rampValues = function (params) {
    const max = params.offset + params.pp
    const min = params.offset - params.pp
    let val = min
    const diff = (max - min) / 100
    for (cnt = 0; cnt < params.steps; cnt++) {
      if (cnt % 200 < 100) {
        val += diff
      } else {
        val -= diff
      }
      simData.push(f.singleStep(val))
    }
  }

  const self = {
    randomStability: function (params) {
      f.reinit()
      simData.length = 0
      randomValues(params)
      for (cnt = params.setup; cnt < simData.length; cnt++) {
        if (simData[cnt] > params.maxStable || simData[cnt] < params.minStable) {
          return simData[cnt]
        }
      }
      return true
    },
    directedRandomStability: function (params) {
      f.reinit()
      simData.length = 0
      let i
      for (i = 0; i < params.tests; i++) {
        const choose = Math.random()
        if (choose < 0.25) {
          randomValues(params)
        } else if (choose < 0.5) {
          stepValues(params)
        } else if (choose < 0.75) {
          impulseValues(params)
        } else {
          rampValues(params)
        }
      }
      randomValues(params)
      for (cnt = params.setup; cnt < simData.length; cnt++) {
        if (simData[cnt] > params.maxStable || simData[cnt] < params.minStable) {
          return simData[cnt]
        }
      }
      return true
    },
    evaluateBehavior: function () {

    }
  }
  return self
}

module.exports = TestFilter
