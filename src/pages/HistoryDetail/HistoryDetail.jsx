import {
  Link,
  useParams,
} from 'react-router-dom'

import './HistoryDetail.css'

function HistoryDetail({ sessions }) {
  const { sessionId } = useParams()

  const session = sessions.find(
    (item) =>
      String(item.id) ===
      String(sessionId)
  )

  if (!session) {
    return (
      <div className="history-detail-page">
        <Link
          className="history-back-link"
          to="/historikk"
        >
          ← Tilbake til historikk
        </Link>

        <section className="history-detail-empty">
          <h1>Fant ikke testøkten</h1>

          <p>
            Testøkten kan ha blitt slettet eller
            åpnet igjen.
          </p>
        </section>
      </div>
    )
  }

  function getSki(skiId) {
    return session.skis.find(
      (ski) => ski.id === skiId
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
      comparison.glideLeaderId ===
      skiA?.id
    ) {
      return (
        `Ski ${skiA.skiNumber} ` +
        `+${comparison.glideDifferenceCm} cm`
      )
    }

    if (
      comparison.glideLeaderId ===
      skiB?.id
    ) {
      return (
        `Ski ${skiB.skiNumber} ` +
        `+${comparison.glideDifferenceCm} cm`
      )
    }

    return comparison.glideDifferenceCm
      ? `${comparison.glideDifferenceCm} cm`
      : 'Ikke registrert'
  }

  function getSetupText(ski) {
    if (!ski) {
      return 'Ukjent oppsett'
    }

    return [
      ski.grind,
      ski.rill,
      ski.glideWax,
      ski.topping,
    ]
      .filter(Boolean)
      .join(' · ')
  }

  function getWinner() {
    if (
      !session.comparisons?.length
    ) {
      return null
    }

    const highestRound =
      Math.max(
        ...session.comparisons.map(
          (comparison) =>
            comparison.round ?? 1
        )
      )

    const finalComparison =
      [...session.comparisons]
        .reverse()
        .find(
          (comparison) =>
            (
              comparison.round ??
              1
            ) === highestRound
        )

    if (!finalComparison) {
      return null
    }

    return getSki(
      finalComparison.winnerId
    )
  }

  const winner = getWinner()

  return (
    <div className="history-detail-page">
      <Link
        className="history-back-link"
        to="/historikk"
      >
        ← Tilbake til historikk
      </Link>

      {/* =========================
          HEADER
      ========================= */}

      <header className="history-detail-header">
        <div>
          <span className="history-detail-status">
            Ferdig testøkt
          </span>

          <h1>{session.title}</h1>

          <p>
            {session.location ||
              'Sted ikke registrert'}
          </p>
        </div>

        <div className="history-detail-date">
          <strong>
            {session.date ||
              'Dato ikke registrert'}
          </strong>

          {session.time && (
            <span>
              kl. {session.time}
            </span>
          )}
        </div>
      </header>

      {/* =========================
          FORHOLD
      ========================= */}

      <section className="history-detail-section">
        <h2>Forhold</h2>

        <div className="history-condition-grid">
          <div>
            <span>Lufttemperatur</span>

            <strong>
              {session.conditions
                ?.airTemperature ??
                '–'}{' '}
              °C
            </strong>
          </div>

          <div>
            <span>Snøtemperatur</span>

            <strong>
              {session.conditions
                ?.snowTemperature ??
                '–'}{' '}
              °C
            </strong>
          </div>

          <div>
            <span>Luftfuktighet</span>

            <strong>
              {session.conditions
                ?.humidity ??
                '–'}{' '}
              %
            </strong>
          </div>

          <div>
            <span>Snøtype</span>

            <strong>
              {session.conditions
                ?.snowType ||
                'Ikke registrert'}
            </strong>
          </div>

          <div>
            <span>Snøtilstand</span>

            <strong>
              {session.conditions
                ?.snowCondition ||
                'Ikke registrert'}
            </strong>
          </div>

          <div>
            <span>Vær</span>

            <strong>
              {session.conditions
                ?.weather ||
                'Ikke registrert'}
            </strong>
          </div>
        </div>
      </section>

      {/* =========================
          VINNER
      ========================= */}

      {winner && (
        <section className="history-winner">
          <div>
            <span>
              🏆 Vinner av testøkten
            </span>

            <h2>
              Ski {winner.skiNumber}
            </h2>
          </div>

          <div className="history-winner-setup">
            <strong>
              {winner.grind ||
                'Slip ikke registrert'}
            </strong>

            <span>
              {getSetupText(winner)}
            </span>
          </div>
        </section>
      )}

      {/* =========================
          SKI
      ========================= */}

      <section className="history-detail-section">
        <div className="history-section-heading">
          <h2>Ski</h2>

          <span>
            {session.skis.length}{' '}
            {session.skis.length === 1
              ? 'ski'
              : 'ski'}
          </span>
        </div>

        <div className="history-ski-grid">
          {[...session.skis]
            .sort(
              (a, b) =>
                a.skiNumber -
                b.skiNumber
            )
            .map((ski) => (
              <article
                className="history-ski-card"
                key={ski.id}
              >
                <h3>
                  Ski {ski.skiNumber}
                </h3>

                <p>
                  <strong>
                    Slip:
                  </strong>{' '}
                  {ski.grind ||
                    'Ikke registrert'}
                </p>

                <p>
                  <strong>
                    Rill:
                  </strong>{' '}
                  {ski.rill ||
                    'Ikke registrert'}
                </p>

                <p>
                  <strong>
                    Glider:
                  </strong>{' '}
                  {ski.glideWax ||
                    'Ikke registrert'}
                </p>

                <p>
                  <strong>
                    Topping:
                  </strong>{' '}
                  {ski.topping ||
                    'Ikke registrert'}
                </p>
              </article>
            ))}
        </div>
      </section>

      {/* =========================
          SAMMENLIGNINGER
      ========================= */}

      <section className="history-detail-section">
        <div className="history-section-heading">
          <h2>Sammenligninger</h2>

          <span>
            {
              session.comparisons
                .length
            }{' '}
            {session.comparisons
              .length === 1
              ? 'duell'
              : 'dueller'}
          </span>
        </div>

        {session.comparisons.length ===
        0 ? (
          <p>
            Ingen sammenligninger
            registrert.
          </p>
        ) : (
          <div className="history-comparison-grid">
            {session.comparisons.map(
              (
                comparison,
                index
              ) => {
                const skiA =
                  getSki(
                    comparison.skiAId
                  )

                const skiB =
                  getSki(
                    comparison.skiBId
                  )

                const duelWinner =
                  getSki(
                    comparison.winnerId
                  )

                const comparisonsInRound =
                  session.comparisons.filter(
                    (item) =>
                      (
                        item.round ??
                        1
                      ) ===
                      (
                        comparison.round ??
                        1
                      )
                  )

                const duelNumber =
                  comparisonsInRound.findIndex(
                    (item) =>
                      item.id ===
                      comparison.id
                  ) + 1

                return (
                  <article
                    className="history-comparison-card"
                    key={
                      comparison.id ??
                      index
                    }
                  >
                    <div className="history-comparison-header">
                      <div>
                        <span>
                          Runde{' '}
                          {comparison.round ??
                            1}
                        </span>

                        <h3>
                          Ski{' '}
                          {
                            skiA?.skiNumber
                          }{' '}
                          vs Ski{' '}
                          {
                            skiB?.skiNumber
                          }
                        </h3>
                      </div>

                      <span>
                        Duell{' '}
                        {duelNumber}
                      </span>
                    </div>

                    <div className="history-comparison-setups">
                      <div>
                        <strong>
                          Ski{' '}
                          {
                            skiA?.skiNumber
                          }
                        </strong>

                        <span>
                          {getSetupText(
                            skiA
                          )}
                        </span>
                      </div>

                      <div>
                        <strong>
                          Ski{' '}
                          {
                            skiB?.skiNumber
                          }
                        </strong>

                        <span>
                          {getSetupText(
                            skiB
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="history-comparison-results">
                      <p>
                        <span>Glid</span>

                        <strong>
                          {getGlideText(
                            comparison,
                            skiA,
                            skiB
                          )}
                        </strong>
                      </p>

                      <p>
                        <span>Følelse</span>

                        <strong>
                          Ski{' '}
                          {
                            skiA?.skiNumber
                          }
                          :{' '}
                          {
                            comparison.feelingA
                          }
                          /5 · Ski{' '}
                          {
                            skiB?.skiNumber
                          }
                          :{' '}
                          {
                            comparison.feelingB
                          }
                          /5
                        </strong>
                      </p>

                      {comparison.calculatedScore !==
                        undefined && (
                        <p>
                          <span>
                            Samlet score
                          </span>

                          <strong>
                            {comparison
                              .calculatedScore >
                            0
                              ? '+'
                              : ''}
                            {
                              comparison.calculatedScore
                            }
                          </strong>
                        </p>
                      )}
                    </div>

                    {duelWinner && (
                      <div className="history-comparison-winner">
                        🏆 Ski{' '}
                        {
                          duelWinner.skiNumber
                        }{' '}
                        vant duellen
                      </div>
                    )}

                    {comparison.winnerOverridden && (
                      <p className="history-override">
                        ⚠️ Resultatet ble
                        manuelt overstyrt
                      </p>
                    )}
                  </article>
                )
              }
            )}
          </div>
        )}
      </section>
    </div>
  )
}

export default HistoryDetail