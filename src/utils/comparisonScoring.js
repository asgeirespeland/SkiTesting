export const FEELING_CM_PER_POINT = 10
export const CLOSE_SCORE_THRESHOLD_CM = 5

export function calculateComparisonResult({
  skiAId,
  skiBId,
  glideLeaderId,
  glideDifferenceCm,
  feelingA,
  feelingB,
}) {
  const difference = Math.max(
    0,
    Number(glideDifferenceCm) || 0
  )

  let glideScore = 0

  if (Number(glideLeaderId) === Number(skiAId)) {
    glideScore = difference
  }

  if (Number(glideLeaderId) === Number(skiBId)) {
    glideScore = -difference
  }

  const feelingDifference =
    Number(feelingA) - Number(feelingB)

  const feelingScore =
    feelingDifference * FEELING_CM_PER_POINT

  const totalScore =
    glideScore + feelingScore

  let automaticWinnerId = null

  if (totalScore > CLOSE_SCORE_THRESHOLD_CM) {
    automaticWinnerId = Number(skiAId)
  }

  if (totalScore < -CLOSE_SCORE_THRESHOLD_CM) {
    automaticWinnerId = Number(skiBId)
  }

  return {
    glideScore,
    feelingScore,
    totalScore,
    automaticWinnerId,
    isTooClose: automaticWinnerId === null,
  }
}