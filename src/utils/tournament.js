function idsAreEqual(idA, idB) {
  return String(idA) === String(idB)
}

export function isSamePair(
  comparison,
  skiAId,
  skiBId
) {
  return (
    (
      idsAreEqual(
        comparison.skiAId,
        skiAId
      ) &&
      idsAreEqual(
        comparison.skiBId,
        skiBId
      )
    ) ||
    (
      idsAreEqual(
        comparison.skiAId,
        skiBId
      ) &&
      idsAreEqual(
        comparison.skiBId,
        skiAId
      )
    )
  )
}

export function getRoundParticipants(
  session,
  round
) {
  const skis =
    session.skis ?? []

  const comparisons =
    session.comparisons ?? []

  const sortedSkis = [
    ...skis,
  ].sort(
    (a, b) =>
      Number(a.skiNumber) -
      Number(b.skiNumber)
  )

  // Runde 1 starter med alle skiene.
  if (round === 1) {
    return sortedSkis.map(
      (ski) => ski.id
    )
  }

  /*
   * For senere runder finner vi
   * deltakerne fra forrige runde.
   */
  const previousParticipants =
    getRoundParticipants(
      session,
      round - 1
    )

  const winners = []

  for (
    let i = 0;
    i <
    previousParticipants.length;
    i += 2
  ) {
    const skiAId =
      previousParticipants[i]

    const skiBId =
      previousParticipants[i + 1]

    /*
     * Oddetall:
     * siste ski får fripass.
     */
    if (
      skiBId === undefined
    ) {
      winners.push(skiAId)
      continue
    }

    const comparison =
      comparisons.find(
        (item) =>
          Number(item.round) ===
            round - 1 &&
          isSamePair(
            item,
            skiAId,
            skiBId
          )
      )

    /*
     * Bare ferdige dueller
     * sender en vinner videre.
     */
    if (
      comparison?.winnerId !==
      undefined
    ) {
      winners.push(
        comparison.winnerId
      )
    }
  }

  return winners
}

export function getTournamentState(
  session
) {
  const skis =
    session.skis ?? []

  const comparisons =
    session.comparisons ?? []

  if (skis.length < 2) {
    return {
      nextPair: null,
      winnerId: null,
    }
  }

  let round = 1

  /*
   * 20 er bare en sikkerhetsgrense.
   * I praksis kommer vi aldri
   * i nærheten av dette.
   */
  while (round <= 20) {
    const participants =
      getRoundParticipants(
        session,
        round
      )

    /*
     * Én deltaker igjen =
     * turneringsvinner.
     */
    if (
      participants.length === 1
    ) {
      return {
        nextPair: null,

        winnerId:
          participants[0],
      }
    }

    /*
     * Hvis ingen deltakere har
     * kommet videre ennå, betyr
     * det at forrige runde ikke
     * er ferdig.
     */
    if (
      participants.length === 0
    ) {
      return {
        nextPair: null,
        winnerId: null,
      }
    }

    for (
      let i = 0;
      i < participants.length;
      i += 2
    ) {
      const skiAId =
        participants[i]

      const skiBId =
        participants[i + 1]

      /*
       * Fripass hvis vi har
       * oddetall i runden.
       */
      if (
        skiBId === undefined
      ) {
        continue
      }

      const existingComparison =
        comparisons.find(
          (comparison) =>
            Number(
              comparison.round
            ) === round &&
            isSamePair(
              comparison,
              skiAId,
              skiBId
            )
        )

      /*
       * Første duell vi ikke finner
       * blir neste duell i UI-et.
       */
      if (!existingComparison) {
        return {
          nextPair: {
            skiAId,
            skiBId,

            round,

            label:
              `Runde ${round} – ` +
              `duell ${
                Math.floor(
                  i / 2
                ) + 1
              }`,
          },

          winnerId: null,
        }
      }
    }

    round += 1
  }

  return {
    nextPair: null,
    winnerId: null,
  }
}