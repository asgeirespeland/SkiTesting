import { useState } from 'react'

import {
  calculateComparisonResult,
  FEELING_CM_PER_POINT,
} from '../../utils/comparisonScoring'

function ComparisonHistory({
  session,
  onUpdateComparison,
  onDeleteComparison,
}) {
  const [
    editingComparisonId,
    setEditingComparisonId,
  ] = useState(null)

  const [
    editedComparison,
    setEditedComparison,
  ] = useState(null)

  // =========================
  // HJELPEFUNKSJONER
  // =========================

  function getSki(skiId) {
    return session.skis.find(
      (ski) =>
        String(ski.id) ===
        String(skiId)
    )
  }

  function getGlideText(
    comparison,
    skiA,
    skiB
  ) {
    if (
      comparison.glideLeaderId === null
    ) {
      return 'Lik glid'
    }

    if (
      String(
        comparison.glideLeaderId
      ) === String(skiA?.id)
    ) {
      return (
        `Ski ${skiA.skiNumber} ` +
        `+${comparison.glideDifferenceCm} cm`
      )
    }

    if (
      String(
        comparison.glideLeaderId
      ) === String(skiB?.id)
    ) {
      return (
        `Ski ${skiB.skiNumber} ` +
        `+${comparison.glideDifferenceCm} cm`
      )
    }

    // Eldre tester
    return comparison.glideDifferenceCm
      ? `${comparison.glideDifferenceCm} cm`
      : 'Ikke registrert'
  }

  function getSetupText(ski) {
    if (!ski) {
      return 'Ukjent oppsett'
    }

    const setup = [
      ski.grind,
      ski.rill,
      ski.glideWax,
      ski.topping,
    ].filter(Boolean)

    if (setup.length === 0) {
      return 'Oppsett ikke registrert'
    }

    return setup.join(' · ')
  }

  function getDuelNumber(comparison) {
    const comparisonsInRound =
      session.comparisons.filter(
        (item) =>
          Number(item.round ?? 1) ===
          Number(
            comparison.round ?? 1
          )
      )

    return (
      comparisonsInRound.findIndex(
        (item) =>
          item.id === comparison.id
      ) + 1
    )
  }

  // =========================
  // START REDIGERING
  // =========================

  function startEditingComparison(
    comparison
  ) {
    setEditingComparisonId(
      comparison.id
    )

    const isLegacyComparison =
      comparison.glideLeaderId ===
      undefined

    setEditedComparison({
      ...comparison,

      glideLeaderId:
        comparison.glideLeaderId ===
        null
          ? 'equal'
          : comparison.glideLeaderId ===
              undefined
            ? ''
            : String(
                comparison.glideLeaderId
              ),

      glideDifferenceCm:
        comparison.glideDifferenceCm ??
        '',

      feelingA:
        comparison.feelingA ?? 3,

      feelingB:
        comparison.feelingB ?? 3,

      manualWinnerId:
        comparison.winnerOverridden ||
        isLegacyComparison
          ? String(
              comparison.winnerId
            )
          : '',
    })
  }

  // =========================
  // REDIGERINGSINPUT
  // =========================

  function handleComparisonChange(
    event
  ) {
    const {
      name,
      value,
    } = event.target

    if (
      name === 'glideLeaderId' &&
      value === 'equal'
    ) {
      setEditedComparison(
        (currentComparison) => ({
          ...currentComparison,

          glideLeaderId:
            'equal',

          glideDifferenceCm:
            '0',
        })
      )

      return
    }

    setEditedComparison(
      (currentComparison) => ({
        ...currentComparison,
        [name]: value,
      })
    )
  }

  // =========================
  // LAGRE REDIGERING
  // =========================

  function saveEditedComparison() {
    if (!editedComparison) {
      return
    }

    if (
      editedComparison.glideLeaderId ===
      ''
    ) {
      alert(
        'Registrer hvem som gled lengst.'
      )

      return
    }

    if (
      editedComparison.glideLeaderId !==
        'equal' &&
      Number(
        editedComparison
          .glideDifferenceCm
      ) <= 0
    ) {
      alert(
        'Registrer glidforskjellen i cm.'
      )

      return
    }

    const normalizedGlideLeaderId =
      editedComparison.glideLeaderId ===
      'equal'
        ? null
        : Number(
            editedComparison
              .glideLeaderId
          )

    const result =
      calculateComparisonResult({
        skiAId:
          editedComparison.skiAId,

        skiBId:
          editedComparison.skiBId,

        glideLeaderId:
          normalizedGlideLeaderId,

        glideDifferenceCm:
          editedComparison
            .glideDifferenceCm,

        feelingA:
          editedComparison.feelingA,

        feelingB:
          editedComparison.feelingB,
      })

    const manualWinnerId =
      editedComparison.manualWinnerId
        ? Number(
            editedComparison
              .manualWinnerId
          )
        : null

    const effectiveWinnerId =
      manualWinnerId ??
      result.automaticWinnerId

    if (!effectiveWinnerId) {
      alert(
        'Resultatet er for jevnt. ' +
          'Test skiene på nytt eller velg en manuell vinner.'
      )

      return
    }

    const winnerOverridden =
      manualWinnerId !== null &&
      manualWinnerId !==
        result.automaticWinnerId

    const originalComparison =
      session.comparisons.find(
        (comparison) =>
          comparison.id ===
          editingComparisonId
      )

    const winnerChanged =
      originalComparison &&
      Number(
        originalComparison.winnerId
      ) !==
        Number(effectiveWinnerId)

    const laterRoundsExist =
      session.comparisons.some(
        (comparison) =>
          Number(
            comparison.round
          ) >
          Number(
            editedComparison.round
          )
      )

    if (
      winnerChanged &&
      laterRoundsExist
    ) {
      const confirmed =
        window.confirm(
          'Du har endret resultatet slik at en annen ski går videre. ' +
            'Senere runder er derfor ikke lenger gyldige og vil bli slettet. ' +
            'Vil du fortsette?'
        )

      if (!confirmed) {
        return
      }
    }

    const updatedComparison = {
      id:
        editedComparison.id,

      skiAId:
        editedComparison.skiAId,

      skiBId:
        editedComparison.skiBId,

      glideLeaderId:
        normalizedGlideLeaderId,

      glideDifferenceCm:
        Number(
          editedComparison
            .glideDifferenceCm
        ),

      feelingA:
        Number(
          editedComparison.feelingA
        ),

      feelingB:
        Number(
          editedComparison.feelingB
        ),

      glideScore:
        result.glideScore,

      feelingScore:
        result.feelingScore,

      calculatedScore:
        result.totalScore,

      automaticWinnerId:
        result.automaticWinnerId,

      winnerId:
        effectiveWinnerId,

      winnerOverridden,

      round:
        editedComparison.round,
    }

    onUpdateComparison(
      session.id,
      updatedComparison
    )

    setEditingComparisonId(null)
    setEditedComparison(null)
  }

  function cancelEditingComparison() {
    setEditingComparisonId(null)
    setEditedComparison(null)
  }

  // =========================
  // SLETT
  // =========================

  function handleDeleteComparison(
    comparison
  ) {
    const laterRoundsExist =
      session.comparisons.some(
        (item) =>
          Number(item.round) >
          Number(comparison.round)
      )

    let message =
      'Vil du slette denne sammenligningen?'

    if (laterRoundsExist) {
      message +=
        '\n\nSenere runder vil også bli slettet.'
    }

    const confirmed =
      window.confirm(message)

    if (!confirmed) {
      return
    }

    onDeleteComparison(
      session.id,
      comparison.id
    )
  }

  // =========================
  // UI
  // =========================

  return (
    <>
      <h3>Sammenligninger</h3>

      {session.comparisons.length ===
        0 && (
        <p>
          Ingen sammenligninger
          registrert ennå.
        </p>
      )}

      <div className="comparison-history">
        {session.comparisons.map(
          (comparison) => {
            const skiA =
              getSki(
                comparison.skiAId
              )

            const skiB =
              getSki(
                comparison.skiBId
              )

            const winner =
              getSki(
                comparison.winnerId
              )

            const automaticWinner =
              getSki(
                comparison
                  .automaticWinnerId
              )

            const duelNumber =
              getDuelNumber(
                comparison
              )

            // =====================
            // LIVE VURDERING
            // =====================

            let editResult = null

            let editAutomaticWinner =
              null

            if (
              editingComparisonId ===
                comparison.id &&
              editedComparison &&
              editedComparison
                .glideLeaderId !== ''
            ) {
              const normalizedLeader =
                editedComparison
                  .glideLeaderId ===
                'equal'
                  ? null
                  : Number(
                      editedComparison
                        .glideLeaderId
                    )

              editResult =
                calculateComparisonResult(
                  {
                    skiAId:
                      editedComparison
                        .skiAId,

                    skiBId:
                      editedComparison
                        .skiBId,

                    glideLeaderId:
                      normalizedLeader,

                    glideDifferenceCm:
                      editedComparison
                        .glideDifferenceCm,

                    feelingA:
                      editedComparison
                        .feelingA,

                    feelingB:
                      editedComparison
                        .feelingB,
                  }
                )

              editAutomaticWinner =
                getSki(
                  editResult
                    .automaticWinnerId
                )
            }

            return (
              <div
                key={comparison.id}
                className="comparison-history-card"
              >
                {editingComparisonId ===
                comparison.id ? (
                  <div>
                    <h4>
                      Rediger Runde{' '}
                      {comparison.round ??
                        1}
                      {' – '}
                      duell{' '}
                      {duelNumber}
                    </h4>

                    <p>
                      Ski{' '}
                      {skiA?.skiNumber}{' '}
                      vs Ski{' '}
                      {skiB?.skiNumber}
                    </p>

                    <h5>Glid</h5>

                    <div>
                      <label>
                        Hvem gled lengst?
                      </label>

                      <select
                        name="glideLeaderId"
                        value={
                          editedComparison
                            .glideLeaderId
                        }
                        onChange={
                          handleComparisonChange
                        }
                      >
                        <option value="">
                          Velg resultat
                        </option>

                        <option
                          value={
                            skiA?.id
                          }
                        >
                          Ski{' '}
                          {
                            skiA?.skiNumber
                          }
                        </option>

                        <option value="equal">
                          Lik glid
                        </option>

                        <option
                          value={
                            skiB?.id
                          }
                        >
                          Ski{' '}
                          {
                            skiB?.skiNumber
                          }
                        </option>
                      </select>
                    </div>

                    <div>
                      <label>
                        Forskjell i glid
                        (cm):
                      </label>

                      <input
                        type="number"
                        min="0"
                        name="glideDifferenceCm"
                        value={
                          editedComparison
                            .glideDifferenceCm
                        }
                        onChange={
                          handleComparisonChange
                        }
                        disabled={
                          editedComparison
                            .glideLeaderId ===
                          'equal'
                        }
                      />
                    </div>

                    <h5>Følelse</h5>

                    <div>
                      <label>
                        Ski{' '}
                        {
                          skiA?.skiNumber
                        }
                        :
                      </label>

                      <select
                        name="feelingA"
                        value={
                          editedComparison
                            .feelingA
                        }
                        onChange={
                          handleComparisonChange
                        }
                      >
                        {[1, 2, 3, 4, 5].map(
                          (value) => (
                            <option
                              key={
                                value
                              }
                              value={
                                value
                              }
                            >
                              {value} / 5
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <div>
                      <label>
                        Ski{' '}
                        {
                          skiB?.skiNumber
                        }
                        :
                      </label>

                      <select
                        name="feelingB"
                        value={
                          editedComparison
                            .feelingB
                        }
                        onChange={
                          handleComparisonChange
                        }
                      >
                        {[1, 2, 3, 4, 5].map(
                          (value) => (
                            <option
                              key={
                                value
                              }
                              value={
                                value
                              }
                            >
                              {value} / 5
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    {editResult && (
                      <div className="comparison-result">
                        <h5>
                          Automatisk
                          vurdering
                        </h5>

                        <p>
                          Glidscore:{' '}
                          <strong>
                            {editResult
                              .glideScore >
                            0
                              ? '+'
                              : ''}
                            {
                              editResult
                                .glideScore
                            }{' '}
                            cm
                          </strong>
                        </p>

                        <p>
                          Følelsesjustering:{' '}
                          <strong>
                            {editResult
                              .feelingScore >
                            0
                              ? '+'
                              : ''}
                            {
                              editResult
                                .feelingScore
                            }{' '}
                            cm
                          </strong>
                        </p>

                        <p>
                          <small>
                            1 poeng
                            følelse ={' '}
                            {
                              FEELING_CM_PER_POINT
                            }{' '}
                            cm
                          </small>
                        </p>

                        <p>
                          Samlet score:{' '}
                          <strong>
                            {editResult
                              .totalScore >
                            0
                              ? '+'
                              : ''}
                            {
                              editResult
                                .totalScore
                            }
                          </strong>
                        </p>

                        {editAutomaticWinner ? (
                          <p>
                            🏆 Automatisk
                            anbefaling:{' '}
                            <strong>
                              Ski{' '}
                              {
                                editAutomaticWinner
                                  .skiNumber
                              }
                            </strong>
                          </p>
                        ) : (
                          <p>
                            ⚖️ Resultatet
                            er for jevnt.
                          </p>
                        )}

                        <div>
                          <label>
                            Overstyr
                            resultat:
                          </label>

                          <select
                            name="manualWinnerId"
                            value={
                              editedComparison
                                .manualWinnerId
                            }
                            onChange={
                              handleComparisonChange
                            }
                          >
                            <option value="">
                              Bruk
                              automatisk
                              vurdering
                            </option>

                            <option
                              value={
                                skiA?.id
                              }
                            >
                              Ski{' '}
                              {
                                skiA?.skiNumber
                              }
                            </option>

                            <option
                              value={
                                skiB?.id
                              }
                            >
                              Ski{' '}
                              {
                                skiB?.skiNumber
                              }
                            </option>
                          </select>
                        </div>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={
                        saveEditedComparison
                      }
                    >
                      Lagre
                    </button>

                    <button
                      type="button"
                      onClick={
                        cancelEditingComparison
                      }
                    >
                      Avbryt
                    </button>
                  </div>
                ) : (
                  <div>
                    <h4>
                      Runde{' '}
                      {comparison.round ??
                        1}
                      {' – '}
                      duell{' '}
                      {duelNumber}
                    </h4>

                    <p>
                      Ski{' '}
                      {skiA?.skiNumber}{' '}
                      vs Ski{' '}
                      {skiB?.skiNumber}
                    </p>

                    <p>
                      <strong>
                        Glid:
                      </strong>{' '}
                      {getGlideText(
                        comparison,
                        skiA,
                        skiB
                      )}
                    </p>

                    <p>
                      <strong>
                        Følelse:
                      </strong>{' '}
                      Ski{' '}
                      {skiA?.skiNumber}:{' '}
                      {comparison.feelingA}
                      /5 · Ski{' '}
                      {skiB?.skiNumber}:{' '}
                      {comparison.feelingB}
                      /5
                    </p>

                    {comparison.glideScore !==
                      undefined && (
                      <p>
                        <strong>
                          Glidscore:
                        </strong>{' '}
                        {comparison
                          .glideScore >
                        0
                          ? '+'
                          : ''}
                        {
                          comparison
                            .glideScore
                        }{' '}
                        cm
                      </p>
                    )}

                    {comparison.feelingScore !==
                      undefined && (
                      <p>
                        <strong>
                          Følelsesjustering:
                        </strong>{' '}
                        {comparison
                          .feelingScore >
                        0
                          ? '+'
                          : ''}
                        {
                          comparison
                            .feelingScore
                        }{' '}
                        cm
                      </p>
                    )}

                    {comparison.calculatedScore !==
                      undefined && (
                      <p>
                        <strong>
                          Samlet score:
                        </strong>{' '}
                        {comparison
                          .calculatedScore >
                        0
                          ? '+'
                          : ''}
                        {
                          comparison
                            .calculatedScore
                        }
                      </p>
                    )}

                    {automaticWinner && (
                      <p>
                        <strong>
                          Automatisk
                          anbefaling:
                        </strong>{' '}
                        Ski{' '}
                        {
                          automaticWinner
                            .skiNumber
                        }
                      </p>
                    )}

                    {winner && (
                      <p>
                        🏆{' '}
                        <strong>
                          Vinner:
                        </strong>{' '}
                        Ski{' '}
                        {
                          winner.skiNumber
                        }
                      </p>
                    )}

                    {comparison.winnerOverridden && (
                      <p>
                        <strong>
                          ⚠️ Resultatet
                          ble manuelt
                          overstyrt
                        </strong>
                      </p>
                    )}

                    <p>
                      <strong>
                        Ski{' '}
                        {
                          skiA?.skiNumber
                        }
                        :
                      </strong>{' '}
                      {getSetupText(
                        skiA
                      )}
                    </p>

                    <p>
                      <strong>
                        Ski{' '}
                        {
                          skiB?.skiNumber
                        }
                        :
                      </strong>{' '}
                      {getSetupText(
                        skiB
                      )}
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        startEditingComparison(
                          comparison
                        )
                      }
                    >
                      Rediger
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteComparison(
                          comparison
                        )
                      }
                    >
                      Slett
                    </button>
                  </div>
                )}
              </div>
            )
          }
        )}
      </div>
    </>
  )
}

export default ComparisonHistory