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
  /*
   * Nye tester:
   * bruk stabil equipment-ID.
   */
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

  /*
   * Gamle tester kan mangle ID.
   * Da prøver vi lagret navn.
   */
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
// HAR TEMPERATURINTERVALL?
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
// TEMPERATURPASSFORM
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

  /*
   * Inne i produsentens
   * anbefalte intervall.
   */
  if (
    temperature >= min &&
    temperature <= max
  ) {
    return 100
  }

  /*
   * Hvor mange grader ligger
   * temperaturen utenfor?
   */
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
   * Gradvis straff.
   *
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
// SAMLET ANBEFALINGSSCORE
// =========================

export function calculateRecommendationScore({
  recommendation,
  equipment = [],
  snowTemperature,
}) {
  const historicalScore =
    Number(
      recommendation
        .adjustedWinRate
    ) || 0

  const temperatureScore =
    getSetupTemperatureFit({
      setup:
        recommendation.setup,

      equipment,

      snowTemperature,
    })

  /*
   * Hvis vi ikke har temperaturdata,
   * bruker vi kun testhistorikken.
   */
  if (
    temperatureScore === null
  ) {
    return {
      combinedScore:
        historicalScore,

      historicalScore,

      temperatureScore:
        null,

      hasTemperatureData:
        false,
    }
  }

  /*
   * 75 % egne tester
   * 25 % produktets temperaturmatch.
   *
   * Testdata får størst betydning.
   */
  const combinedScore =
    historicalScore *
      0.75 +
    temperatureScore *
      0.25

  return {
    combinedScore,

    historicalScore,

    temperatureScore,

    hasTemperatureData:
      true,
  }
}