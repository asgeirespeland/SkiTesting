import {
  calculateConditionSimilarity,
} from './conditionSimilarity'

const PRIOR_WEIGHT = 3
const PRIOR_WIN_RATE = 0.5

function idsAreEqual(
  idA,
  idB
) {
  return (
    String(idA) ===
    String(idB)
  )
}

function normalizeText(value) {
  return String(
    value ?? ''
  )
    .trim()
    .toLowerCase()
}

function createSetupKey(ski) {
  return [
    normalizeText(ski.grind),
    normalizeText(ski.rill),
    normalizeText(
      ski.glideWax
    ),
    normalizeText(
      ski.topping
    ),
  ].join('|')
}

function createSetup(ski) {
  return {
    grind:
      ski.grind?.trim() ?? '',

    rill:
      ski.rill?.trim() ?? '',

    glideWax:
      ski.glideWax?.trim() ?? '',

    topping:
      ski.topping?.trim() ?? '',
  }
}

function hasSetupData(ski) {
  return Boolean(
    ski.grind?.trim() ||
      ski.rill?.trim() ||
      ski.glideWax?.trim() ||
      ski.topping?.trim()
  )
}

function getOrCreateResult(
  results,
  ski
) {
  const key =
    createSetupKey(ski)

  if (!results.has(key)) {
    results.set(key, {
      key,

      setup:
        createSetup(ski),

      comparisons: 0,
      wins: 0,

      weightedComparisons: 0,
      weightedWins: 0,

      weightedScore: 0,

      relevantSessions:
        new Set(),
    })
  }

  return results.get(key)
}

export function getSetupRecommendations(
  sessions,
  targetConditions,
  options = {}
) {
  const minimumSimilarity =
    options.minimumSimilarity ??
    50

  const results =
    new Map()

  for (const session of sessions) {
    const similarity =
      calculateConditionSimilarity(
        targetConditions,
        session.conditions ?? {}
      )

    if (
      similarity <
      minimumSimilarity
    ) {
      continue
    }

    const weight =
      similarity / 100

    for (
      const comparison of
      session.comparisons ?? []
    ) {
      const skiA =
        session.skis?.find(
          (ski) =>
            idsAreEqual(
              ski.id,
              comparison.skiAId
            )
        )

      const skiB =
        session.skis?.find(
          (ski) =>
            idsAreEqual(
              ski.id,
              comparison.skiBId
            )
        )

      if (!skiA || !skiB) {
        continue
      }

      if (
        !hasSetupData(skiA) ||
        !hasSetupData(skiB)
      ) {
        continue
      }

      const setupAKey =
        createSetupKey(skiA)

      const setupBKey =
        createSetupKey(skiB)

      /*
       * Hvis begge skiene har
       * nøyaktig samme oppsett,
       * lærer vi ingenting om hvilket
       * oppsett som er best.
       */
      if (
        setupAKey ===
        setupBKey
      ) {
        continue
      }

      const resultA =
        getOrCreateResult(
          results,
          skiA
        )

      const resultB =
        getOrCreateResult(
          results,
          skiB
        )

      resultA.comparisons += 1
      resultB.comparisons += 1

      resultA.weightedComparisons +=
        weight

      resultB.weightedComparisons +=
        weight

      resultA.relevantSessions.add(
        session.id
      )

      resultB.relevantSessions.add(
        session.id
      )

      // =====================
      // VINNER
      // =====================

      if (
        idsAreEqual(
          comparison.winnerId,
          skiA.id
        )
      ) {
        resultA.wins += 1

        resultA.weightedWins +=
          weight
      }

      if (
        idsAreEqual(
          comparison.winnerId,
          skiB.id
        )
      ) {
        resultB.wins += 1

        resultB.weightedWins +=
          weight
      }

      // =====================
      // SCORE
      // =====================

      const score =
        Number(
          comparison.calculatedScore
        )

      if (
        Number.isFinite(score)
      ) {
        /*
         * Positiv calculatedScore
         * betyr fordel Ski A.
         *
         * For Ski B snur vi derfor
         * fortegnet.
         */
        resultA.weightedScore +=
          score * weight

        resultB.weightedScore +=
          -score * weight
      }
    }
  }

  return [
    ...results.values(),
  ]
    .map((result) => {
      const rawWinRate =
        result.comparisons > 0
          ? (
              result.wins /
              result.comparisons
            ) * 100
          : 0

      /*
       * Vi legger inn en svak
       * "50/50-prior".
       *
       * Dermed vil ikke et oppsett
       * med 1 seier av 1 automatisk
       * se sikrere ut enn et oppsett
       * med 18 seire av 25.
       */
      const adjustedWinRate =
        (
          (
            result.weightedWins +
            PRIOR_WIN_RATE *
              PRIOR_WEIGHT
          ) /
          (
            result.weightedComparisons +
            PRIOR_WEIGHT
          )
        ) * 100

      const weightedAverageScore =
        result.weightedComparisons >
        0
          ? result.weightedScore /
            result.weightedComparisons
          : 0

      /*
       * Rundt 8 fullt vektede
       * sammenligninger gir høy
       * datatillit.
       */
      const dataConfidence =
        Math.min(
          100,
          (
            result.weightedComparisons /
            8
          ) * 100
        )

      return {
        ...result,

        relevantSessionCount:
          result.relevantSessions
            .size,

        rawWinRate:
          Math.round(
            rawWinRate
          ),

        adjustedWinRate:
          Math.round(
            adjustedWinRate
          ),

        weightedAverageScore:
          Math.round(
            weightedAverageScore *
              10
          ) / 10,

        dataConfidence:
          Math.round(
            dataConfidence
          ),
      }
    })
    .sort((a, b) => {
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
    })
}