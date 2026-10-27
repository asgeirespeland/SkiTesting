import {
  calculateConditionSimilarity,
} from './conditionSimilarity'

const PRIOR_WEIGHT = 3
const PRIOR_WIN_RATE = 0.5

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
// SAMMENLIGN ID-ER
// =========================

function idsAreEqual(
  idA,
  idB
) {
  return (
    String(idA) ===
    String(idB)
  )
}

// =========================
// OPPSETT-FELTER
// =========================

const SETUP_PARTS = [
  {
    nameField: 'grind',
    idField: 'grindId',
  },
  {
    nameField: 'rill',
    idField: 'rillId',
  },
  {
    nameField: 'glideWax',
    idField: 'glideWaxId',
  },
  {
    nameField: 'topping',
    idField: 'toppingId',
  },
]

// =========================
// HAR SKIEN OPPSETT?
// =========================

function hasSetupData(
  ski
) {
  if (!ski) {
    return false
  }

  return SETUP_PARTS.some(
    ({
      nameField,
      idField,
    }) => {
      const id =
        ski[idField]

      const name =
        normalizeText(
          ski[nameField]
        )

      return (
        (
          id !== null &&
          id !== undefined &&
          id !== ''
        ) ||
        name !== ''
      )
    }
  )
}

// =========================
// IDENTITET FOR EN DEL
// =========================

function getSetupPartIdentity(
  ski,
  idField,
  nameField
) {
  const id =
    ski?.[idField]

  /*
   * ID prioriteres.
   *
   * Hvis produktet senere
   * får nytt navn, vil tester
   * fortsatt vite at dette er
   * samme produkt.
   */
  if (
    id !== null &&
    id !== undefined &&
    id !== ''
  ) {
    return `id:${String(id)}`
  }

  /*
   * Eldre tester har kanskje
   * ikke ID. Da bruker vi navn
   * som fallback.
   */
  const name =
    normalizeText(
      ski?.[nameField]
    )

  if (name) {
    return `name:${name}`
  }

  return 'none'
}

// =========================
// UNIK NØKKEL FOR OPPSETT
// =========================

function getSetupKey(
  ski
) {
  if (
    !hasSetupData(ski)
  ) {
    return null
  }

  return SETUP_PARTS
    .map(
      ({
        nameField,
        idField,
      }) =>
        getSetupPartIdentity(
          ski,
          idField,
          nameField
        )
    )
    .join('|')
}

// =========================
// OPPSETT SOM SKAL VISES
// =========================

function getSetupSnapshot(
  ski
) {
  return {
    grindId:
      ski.grindId ?? null,

    grind:
      ski.grind ?? '',

    rillId:
      ski.rillId ?? null,

    rill:
      ski.rill ?? '',

    glideWaxId:
      ski.glideWaxId ??
      null,

    glideWax:
      ski.glideWax ?? '',

    toppingId:
      ski.toppingId ??
      null,

    topping:
      ski.topping ?? '',
  }
}

// =========================
// RESULTAT FOR ET OPPSETT
// =========================

function createSetupResult(
  ski,
  setupKey
) {
  return {
    setupKey,

    setup:
      getSetupSnapshot(
        ski
      ),

    comparisons: 0,
    wins: 0,

    weightedComparisons: 0,
    weightedWins: 0,
    weightedScore: 0,

    relevantSessions:
      new Set(),
  }
}

// =========================
// SCORE FRA SKIENS PERSPEKTIV
// =========================

function getScoreForSki(
  comparison,
  skiId
) {
  const score =
    Number(
      comparison.calculatedScore
    ) || 0

  if (
    idsAreEqual(
      comparison.skiAId,
      skiId
    )
  ) {
    return score
  }

  if (
    idsAreEqual(
      comparison.skiBId,
      skiId
    )
  ) {
    return -score
  }

  return 0
}

// =========================
// REGISTRER ÉN SKI
// =========================

function addComparisonResult({
  result,
  ski,
  comparison,
  session,
  weight,
}) {
  result.comparisons += 1

  result.weightedComparisons +=
    weight

  result.weightedScore +=
    getScoreForSki(
      comparison,
      ski.id
    ) * weight

  result.relevantSessions.add(
    session.id
  )

  if (
    idsAreEqual(
      comparison.winnerId,
      ski.id
    )
  ) {
    result.wins += 1

    result.weightedWins +=
      weight
  }
}

// =========================
// ANBEFALINGER
// =========================

export function getSetupRecommendations({
  sessions = [],
  conditions = {},
  minimumSimilarity = 50,
}) {
  const setupResults =
    new Map()

  sessions.forEach(
    (session) => {
      const similarity =
        calculateConditionSimilarity(
          session.conditions ?? {},
          conditions
        )

      if (
        similarity <
        minimumSimilarity
      ) {
        return
      }

      const weight =
        similarity / 100

      const skis =
        session.skis ?? []

      const comparisons =
        session.comparisons ??
        []

      comparisons.forEach(
        (comparison) => {
          const skiA =
            skis.find(
              (ski) =>
                idsAreEqual(
                  ski.id,
                  comparison.skiAId
                )
            )

          const skiB =
            skis.find(
              (ski) =>
                idsAreEqual(
                  ski.id,
                  comparison.skiBId
                )
            )

          if (
            !skiA ||
            !skiB
          ) {
            return
          }

          const setupKeyA =
            getSetupKey(
              skiA
            )

          const setupKeyB =
            getSetupKey(
              skiB
            )

          /*
           * Vi trenger faktisk
           * oppsettdata for begge.
           */
          if (
            !setupKeyA ||
            !setupKeyB
          ) {
            return
          }

          /*
           * Hvis begge ski har
           * identisk oppsett gir
           * duellen ingen informasjon
           * om hvilket oppsett som
           * er best.
           */
          if (
            setupKeyA ===
            setupKeyB
          ) {
            return
          }

          /*
           * En duell uten registrert
           * vinner brukes ikke.
           */
          if (
            comparison.winnerId ===
              null ||
            comparison.winnerId ===
              undefined ||
            comparison.winnerId ===
              ''
          ) {
            return
          }

          // =====================
          // OPPSETT A
          // =====================

          if (
            !setupResults.has(
              setupKeyA
            )
          ) {
            setupResults.set(
              setupKeyA,
              createSetupResult(
                skiA,
                setupKeyA
              )
            )
          }

          // =====================
          // OPPSETT B
          // =====================

          if (
            !setupResults.has(
              setupKeyB
            )
          ) {
            setupResults.set(
              setupKeyB,
              createSetupResult(
                skiB,
                setupKeyB
              )
            )
          }

          const resultA =
            setupResults.get(
              setupKeyA
            )

          const resultB =
            setupResults.get(
              setupKeyB
            )

          addComparisonResult({
            result:
              resultA,

            ski:
              skiA,

            comparison,

            session,

            weight,
          })

          addComparisonResult({
            result:
              resultB,

            ski:
              skiB,

            comparison,

            session,

            weight,
          })
        }
      )
    }
  )

  // =========================
  // BEREGN SLUTTRESULTAT
  // =========================

  const recommendations =
    Array.from(
      setupResults.values()
    ).map(
      (result) => {
        const rawWinRate =
          result.comparisons >
          0
            ? (
                result.wins /
                result.comparisons
              ) *
              100
            : 0

        /*
         * Vi bruker en liten prior
         * slik at f.eks. 1 seier av
         * 1 test ikke automatisk
         * blir vurdert som 100 %
         * sikkert.
         */
        const adjustedWinRate =
          (
            result.weightedWins +
            PRIOR_WIN_RATE *
              PRIOR_WEIGHT
          ) /
          (
            result.weightedComparisons +
            PRIOR_WEIGHT
          ) *
          100

        const weightedAverageScore =
          result.weightedComparisons >
          0
            ? result.weightedScore /
              result.weightedComparisons
            : 0

        /*
         * Rundt åtte godt matchende
         * sammenligninger gir foreløpig
         * full datatillit.
         */
        const dataConfidence =
          Math.min(
            100,
            (
              result.weightedComparisons /
              8
            ) *
              100
          )

        return {
          setupKey:
            result.setupKey,

          setup:
            result.setup,

          comparisons:
            result.comparisons,

          wins:
            result.wins,

          rawWinRate,

          adjustedWinRate,

          weightedComparisons:
            result.weightedComparisons,

          weightedAverageScore,

          dataConfidence,

          relevantSessionCount:
            result.relevantSessions
              .size,
        }
      }
    )

  // =========================
  // SORTERING
  // =========================

  return recommendations.sort(
    (a, b) => {
      if (
        b.adjustedWinRate !==
        a.adjustedWinRate
      ) {
        return (
          b.adjustedWinRate -
          a.adjustedWinRate
        )
      }

      if (
        b.weightedAverageScore !==
        a.weightedAverageScore
      ) {
        return (
          b.weightedAverageScore -
          a.weightedAverageScore
        )
      }

      return (
        b.weightedComparisons -
        a.weightedComparisons
      )
    }
  )
}