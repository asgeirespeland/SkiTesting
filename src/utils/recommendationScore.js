// =========================
// NORMALISERING
// =========================

function normalizeText(
  value
) {
  if (
    typeof value !== 'string'
  ) {
    return ''
  }

  return value
    .trim()
    .toLowerCase()
}

// =========================
// FINN UTSTYR
// =========================

function findEquipmentItem({
  equipment,
  id,
  name,
  type,
}) {
  if (
    id !== null &&
    id !== undefined &&
    id !== ''
  ) {
    const byId =
      equipment.find(
        (item) =>
          String(item.id) ===
          String(id)
      )

    if (byId) {
      return byId
    }
  }

  const normalizedName =
    normalizeText(name)

  if (!normalizedName) {
    return null
  }

  return (
    equipment.find(
      (item) => {
        if (
          item.type !== type
        ) {
          return false
        }

        const fullName =
          item.brand
            ? `${item.brand} ${item.name}`
            : item.name

        return (
          normalizeText(
            fullName
          ) ===
          normalizedName
        )
      }
    ) ?? null
  )
}

// =========================
// TEMPERATURINTERVALL
// =========================

function hasTemperatureRange(
  item
) {
  return (
    item &&
    item.minTemperature !==
      null &&
    item.minTemperature !==
      undefined &&
    item.minTemperature !==
      '' &&
    item.maxTemperature !==
      null &&
    item.maxTemperature !==
      undefined &&
    item.maxTemperature !==
      ''
  )
}

// =========================
// TEMPERATURSCORE
// =========================

export function calculateTemperatureFit(
  item,
  snowTemperature
) {
  if (
    snowTemperature === null ||
    snowTemperature === undefined ||
    !hasTemperatureRange(item)
  ) {
    return null
  }

  const temperature =
    Number(
      snowTemperature
    )

  const min =
    Number(
      item.minTemperature
    )

  const max =
    Number(
      item.maxTemperature
    )

  if (
    temperature >= min &&
    temperature <= max
  ) {
    return 100
  }

  let difference = 0

  if (
    temperature < min
  ) {
    difference =
      min - temperature
  }

  if (
    temperature > max
  ) {
    difference =
      temperature - max
  }

  /*
   * 1 °C utenfor = 80
   * 2 °C utenfor = 60
   * 3 °C utenfor = 40
   * 4 °C utenfor = 20
   * 5+ °C utenfor = 0
   */
  return Math.max(
    0,
    100 -
      difference * 20
  )
}

// =========================
// FØREPROFIL
// =========================

function hasSnowTypeProfile(
  item
) {
  return (
    Array.isArray(
      item?.snowTypes
    ) &&
    item.snowTypes.length >
      0
  )
}

function hasSnowConditionProfile(
  item
) {
  return (
    Array.isArray(
      item?.snowConditions
    ) &&
    item.snowConditions
      .length > 0
  )
}

// =========================
// SCORE FOR SNØTYPE
// =========================

function calculateSnowTypeFit(
  item,
  snowType
) {
  if (
    !snowType ||
    !hasSnowTypeProfile(
      item
    )
  ) {
    return null
  }

  return item.snowTypes.includes(
    snowType
  )
    ? 100
    : 0
}

// =========================
// SCORE FOR SNØFORHOLD
// =========================

function calculateSnowConditionFit(
  item,
  snowCondition
) {
  if (
    !snowCondition ||
    !hasSnowConditionProfile(
      item
    )
  ) {
    return null
  }

  return item.snowConditions.includes(
    snowCondition
  )
    ? 100
    : 0
}

// =========================
// FØRESCORE FOR ÉN DEL
// =========================

function calculateEquipmentSnowFit(
  item,
  conditions
) {
  if (!item) {
    return null
  }

  const scores = [
    calculateSnowTypeFit(
      item,
      conditions.snowType
    ),

    calculateSnowConditionFit(
      item,
      conditions.snowCondition
    ),
  ].filter(
    (score) =>
      score !== null
  )

  if (
    scores.length === 0
  ) {
    return null
  }

  return (
    scores.reduce(
      (sum, score) =>
        sum + score,
      0
    ) / scores.length
  )
}

// =========================
// TEMPERATURSCORE FOR OPPSETT
// =========================

export function getSetupTemperatureFit({
  setup,
  equipment = [],
  snowTemperature,
}) {
  if (
    snowTemperature === null ||
    snowTemperature === undefined
  ) {
    return null
  }

  const glideWax =
    findEquipmentItem({
      equipment,

      id:
        setup.glideWaxId,

      name:
        setup.glideWax,

      type:
        'glideWax',
    })

  const topping =
    findEquipmentItem({
      equipment,

      id:
        setup.toppingId,

      name:
        setup.topping,

      type:
        'topping',
    })

  const scores = [
    calculateTemperatureFit(
      glideWax,
      snowTemperature
    ),

    calculateTemperatureFit(
      topping,
      snowTemperature
    ),
  ].filter(
    (score) =>
      score !== null
  )

  if (
    scores.length === 0
  ) {
    return null
  }

  return (
    scores.reduce(
      (sum, score) =>
        sum + score,
      0
    ) / scores.length
  )
}

// =========================
// FØRESCORE FOR OPPSETT
// =========================

export function getSetupSnowFit({
  setup,
  equipment = [],
  conditions = {},
}) {
  const grind =
    findEquipmentItem({
      equipment,

      id:
        setup.grindId,

      name:
        setup.grind,

      type:
        'grind',
    })

  const rill =
    findEquipmentItem({
      equipment,

      id:
        setup.rillId,

      name:
        setup.rill,

      type:
        'rill',
    })

  const scores = [
    calculateEquipmentSnowFit(
      grind,
      conditions
    ),

    calculateEquipmentSnowFit(
      rill,
      conditions
    ),
  ].filter(
    (score) =>
      score !== null
  )

  if (
    scores.length === 0
  ) {
    return null
  }

  return (
    scores.reduce(
      (sum, score) =>
        sum + score,
      0
    ) / scores.length
  )
}

// =========================
// PRODUKTSCORE
// =========================

function calculateProductFit({
  setup,
  equipment,
  conditions,
}) {
  const temperatureScore =
    getSetupTemperatureFit({
      setup,
      equipment,

      snowTemperature:
        conditions
          .snowTemperature,
    })

  const snowFitScore =
    getSetupSnowFit({
      setup,
      equipment,
      conditions,
    })

  const scores = [
    temperatureScore,
    snowFitScore,
  ].filter(
    (score) =>
      score !== null
  )

  if (
    scores.length === 0
  ) {
    return {
      productScore:
        null,

      temperatureScore,

      snowFitScore,
    }
  }

  return {
    productScore:
      scores.reduce(
        (sum, score) =>
          sum + score,
        0
      ) / scores.length,

    temperatureScore,

    snowFitScore,
  }
}

// =========================
// SAMLET ANBEFALINGSSCORE
// =========================

export function calculateRecommendationScore({
  recommendation,
  equipment = [],
  conditions = {},
}) {
  const historicalScore =
    Number(
      recommendation
        .adjustedWinRate
    ) || 0

  const {
    productScore,
    temperatureScore,
    snowFitScore,
  } =
    calculateProductFit({
      setup:
        recommendation.setup,

      equipment,

      conditions,
    })

  /*
   * Hvis katalogen ikke gir
   * noe ekstra informasjon,
   * bruker vi bare historikken.
   */
  if (
    productScore === null
  ) {
    return {
      combinedScore:
        historicalScore,

      historicalScore,

      productScore:
        null,

      temperatureScore,

      snowFitScore,

      hasProductData:
        false,
    }
  }

  /*
   * Egne testresultater teller mest.
   *
   * 75 % historikk
   * 25 % katalog/føredata
   */
  const combinedScore =
    historicalScore *
      0.75 +
    productScore *
      0.25

  return {
    combinedScore,

    historicalScore,

    productScore,

    temperatureScore,

    snowFitScore,

    hasProductData:
      true,
  }
}