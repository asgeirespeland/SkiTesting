function hasValue(value) {
  return (
    value !== null &&
    value !== undefined &&
    value !== ''
  )
}

function addExactMatch(
  result,
  targetValue,
  historicalValue,
  weight
) {
  if (
    !hasValue(targetValue) ||
    !hasValue(historicalValue)
  ) {
    return result
  }

  result.maxScore += weight

  if (
    String(targetValue)
      .toLowerCase()
      .trim() ===
    String(historicalValue)
      .toLowerCase()
      .trim()
  ) {
    result.score += weight
  }

  return result
}

function addNumericMatch(
  result,
  targetValue,
  historicalValue,
  weight,
  thresholds
) {
  if (
    !hasValue(targetValue) ||
    !hasValue(historicalValue)
  ) {
    return result
  }

  const target =
    Number(targetValue)

  const historical =
    Number(historicalValue)

  if (
    Number.isNaN(target) ||
    Number.isNaN(historical)
  ) {
    return result
  }

  result.maxScore += weight

  const difference =
    Math.abs(
      target - historical
    )

  for (const threshold of thresholds) {
    if (
      difference <=
      threshold.maxDifference
    ) {
      result.score +=
        weight *
        threshold.factor

      break
    }
  }

  return result
}

export function calculateConditionSimilarity(
  targetConditions,
  historicalConditions
) {
  const result = {
    score: 0,
    maxScore: 0,
  }

  // =========================
  // SNØTYPE
  // =========================

  addExactMatch(
    result,
    targetConditions.snowType,
    historicalConditions.snowType,
    25
  )

  // =========================
  // SNØFORHOLD
  // =========================

  addExactMatch(
    result,
    targetConditions.snowCondition,
    historicalConditions.snowCondition,
    25
  )

  // =========================
  // SNØTEMPERATUR
  // =========================

  addNumericMatch(
    result,
    targetConditions.snowTemperature,
    historicalConditions.snowTemperature,
    20,
    [
      {
        maxDifference: 0,
        factor: 1,
      },
      {
        maxDifference: 1,
        factor: 0.9,
      },
      {
        maxDifference: 2,
        factor: 0.75,
      },
      {
        maxDifference: 3,
        factor: 0.5,
      },
      {
        maxDifference: 5,
        factor: 0.25,
      },
    ]
  )

  // =========================
  // LUFTTEMPERATUR
  // =========================

  addNumericMatch(
    result,
    targetConditions.airTemperature,
    historicalConditions.airTemperature,
    15,
    [
      {
        maxDifference: 0,
        factor: 1,
      },
      {
        maxDifference: 1,
        factor: 0.87,
      },
      {
        maxDifference: 2,
        factor: 0.67,
      },
      {
        maxDifference: 4,
        factor: 0.33,
      },
    ]
  )

  // =========================
  // LUFTFUKTIGHET
  // =========================

  addNumericMatch(
    result,
    targetConditions.humidity,
    historicalConditions.humidity,
    10,
    [
      {
        maxDifference: 5,
        factor: 1,
      },
      {
        maxDifference: 10,
        factor: 0.8,
      },
      {
        maxDifference: 20,
        factor: 0.5,
      },
      {
        maxDifference: 30,
        factor: 0.2,
      },
    ]
  )

  // =========================
  // VÆR
  // =========================

  addExactMatch(
    result,
    targetConditions.weather,
    historicalConditions.weather,
    5
  )

  if (result.maxScore === 0) {
    return 0
  }

  return Math.round(
    (
      result.score /
      result.maxScore
    ) * 100
  )
}