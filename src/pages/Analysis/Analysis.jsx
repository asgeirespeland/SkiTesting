import { useState } from 'react'
import { Link } from 'react-router-dom'

import {
  SNOW_TYPES,
  SNOW_CONDITIONS,
  WEATHER_OPTIONS,
} from '../../config/conditionOptions'

import {
  calculateConditionSimilarity,
} from '../../utils/conditionSimilarity'

import {
  getSetupRecommendations,
} from '../../utils/setupRecommendations'

import '../../styles/PageLayout.css'
import './Analysis.css'

function Analysis({
  sessions,
}) {
  const [
    conditions,
    setConditions,
  ] = useState({
    airTemperature: '',
    snowTemperature: '',
    humidity: '',
    snowType: '',
    snowCondition: '',
    weather: '',
  })

  // =========================
  // INPUT
  // =========================

  function handleChange(event) {
    const {
      name,
      value,
    } = event.target

    setConditions(
      (currentConditions) => ({
        ...currentConditions,
        [name]: value,
      })
    )
  }

  // =========================
  // HAR VI FORHOLD?
  // =========================

  const hasConditions =
    Object.values(
      conditions
    ).some(
      (value) =>
        value !== ''
    )

  // =========================
  // LIGNENDE TESTØKTER
  // =========================

  const matchingSessions =
    hasConditions
      ? sessions
          .map(
            (session) => ({
              session,

              similarity:
                calculateConditionSimilarity(
                  conditions,
                  session.conditions ?? {}
                ),
            })
          )
          .sort(
            (a, b) =>
              b.similarity -
              a.similarity
          )
      : []

  // =========================
  // ANBEFALINGER
  // =========================

  const recommendations =
    hasConditions
      ? getSetupRecommendations(
          sessions,
          conditions,
          {
            minimumSimilarity: 50,
          }
        )
      : []

  // =========================
  // VINNER AV TESTØKT
  // =========================

  function getWinner(session) {
    if (
      !session.comparisons?.length
    ) {
      return null
    }

    const highestRound =
      Math.max(
        ...session.comparisons.map(
          (comparison) =>
            Number(
              comparison.round ?? 1
            )
        )
      )

    const finalComparison =
      [...session.comparisons]
        .reverse()
        .find(
          (comparison) =>
            Number(
              comparison.round ?? 1
            ) === highestRound
        )

    if (!finalComparison) {
      return null
    }

    return session.skis.find(
      (ski) =>
        String(ski.id) ===
        String(
          finalComparison.winnerId
        )
    )
  }

  // =========================
  // OPPSETTSTEKST
  // =========================

  function getSetupText(
    setup
  ) {
    const parts = [
      setup.grind,
      setup.rill,
      setup.glideWax,
      setup.topping,
    ].filter(Boolean)

    return parts.length > 0
      ? parts.join(' · ')
      : 'Oppsett ikke registrert'
  }

  // =========================
  // DATATILLIT
  // =========================

  function getConfidenceText(
    confidence
  ) {
    if (confidence >= 75) {
      return 'Høy'
    }

    if (confidence >= 40) {
      return 'Middels'
    }

    return 'Lav'
  }

  // =========================
  // TOTALT ANTALL DUELLER
  // =========================

  const totalComparisons =
    sessions.reduce(
      (
        total,
        session
      ) =>
        total +
        (
          session.comparisons
            ?.length ?? 0
        ),
      0
    )

  return (
    <main className="home">
      {/* =========================
          HEADER
      ========================= */}

      <header className="home-header">
        <div>
          <h1>
            Analyse
          </h1>

          <p>
            Finn de beste
            skioppsettene for
            dagens forhold
          </p>
        </div>
      </header>

      {/* =========================
          DATAGRUNNLAG
      ========================= */}

      <section className="panel analysis-data">
        <h2>
          Datagrunnlag
        </h2>

        <div className="analysis-data-stats">
          <div>
            <strong>
              {sessions.length}
            </strong>

            <span>
              ferdige testøkter
            </span>
          </div>

          <div>
            <strong>
              {totalComparisons}
            </strong>

            <span>
              sammenligninger
            </span>
          </div>
        </div>
      </section>

      {/* =========================
          DAGENS FORHOLD
      ========================= */}

      <section className="panel">
        <div className="analysis-section-heading">
          <h2>
            Dagens forhold
          </h2>

          <p>
            Fyll inn det du vet.
            Du trenger ikke fylle
            ut alle feltene.
          </p>
        </div>

        <div className="analysis-condition-grid">
          {/* Lufttemperatur */}

          <div>
            <label>
              Lufttemperatur
            </label>

            <div className="analysis-number-input">
              <input
                type="number"
                step="0.1"
                name="airTemperature"
                value={
                  conditions
                    .airTemperature
                }
                onChange={
                  handleChange
                }
                placeholder="-5"
              />

              <span>
                °C
              </span>
            </div>
          </div>

          {/* Snøtemperatur */}

          <div>
            <label>
              Snøtemperatur
            </label>

            <div className="analysis-number-input">
              <input
                type="number"
                step="0.1"
                name="snowTemperature"
                value={
                  conditions
                    .snowTemperature
                }
                onChange={
                  handleChange
                }
                placeholder="-7"
              />

              <span>
                °C
              </span>
            </div>
          </div>

          {/* Luftfuktighet */}

          <div>
            <label>
              Luftfuktighet
            </label>

            <div className="analysis-number-input">
              <input
                type="number"
                min="0"
                max="100"
                name="humidity"
                value={
                  conditions
                    .humidity
                }
                onChange={
                  handleChange
                }
                placeholder="75"
              />

              <span>
                %
              </span>
            </div>
          </div>

          {/* Snøtype */}

          <div>
            <label>
              Snøtype
            </label>

            <select
              name="snowType"
              value={
                conditions.snowType
              }
              onChange={
                handleChange
              }
            >
              <option value="">
                Ikke valgt
              </option>

              {SNOW_TYPES.map(
                (option) => (
                  <option
                    key={option}
                    value={option}
                  >
                    {option}
                  </option>
                )
              )}
            </select>
          </div>

          {/* Snøforhold */}

          <div>
            <label>
              Snøforhold
            </label>

            <select
              name="snowCondition"
              value={
                conditions
                  .snowCondition
              }
              onChange={
                handleChange
              }
            >
              <option value="">
                Ikke valgt
              </option>

              {SNOW_CONDITIONS.map(
                (option) => (
                  <option
                    key={option}
                    value={option}
                  >
                    {option}
                  </option>
                )
              )}
            </select>
          </div>

          {/* Vær */}

          <div>
            <label>
              Vær
            </label>

            <select
              name="weather"
              value={
                conditions.weather
              }
              onChange={
                handleChange
              }
            >
              <option value="">
                Ikke valgt
              </option>

              {WEATHER_OPTIONS.map(
                (option) => (
                  <option
                    key={option}
                    value={option}
                  >
                    {option}
                  </option>
                )
              )}
            </select>
          </div>
        </div>
      </section>

      {/* =========================
          ANBEFALINGER
      ========================= */}

      <section className="analysis-results">
        <div className="analysis-results-heading">
          <div>
            <h2>
              Anbefalte oppsett
            </h2>

            <p>
              Basert på historiske
              dueller med minst
              50 % like forhold.
            </p>
          </div>
        </div>

        {/* Ingen forhold valgt */}

        {!hasConditions && (
          <div className="panel analysis-empty">
            <h3>
              Legg inn dagens
              forhold
            </h3>

            <p>
              Da kan vi begynne å
              rangere tidligere
              skioppsett.
            </p>
          </div>
        )}

        {/* Ingen anbefalinger */}

        {hasConditions &&
          recommendations.length ===
            0 && (
            <div className="panel analysis-empty">
              <h3>
                Ikke nok relevante
                data
              </h3>

              <p>
                Ingen oppsett har
                foreløpig blitt
                testet i forhold som
                ligner nok.
              </p>
            </div>
          )}

        {/* Anbefalinger */}

        {hasConditions &&
          recommendations.length >
            0 && (
            <div className="recommendation-list">
              {recommendations.map(
                (
                  recommendation,
                  index
                ) => (
                  <article
                    key={
                      recommendation.key
                    }
                    className={
                      index === 0
                        ? 'recommendation-card recommendation-card-best'
                        : 'recommendation-card'
                    }
                  >
                    {/* Rangering */}

                    <div className="recommendation-rank">
                      {index === 0
                        ? '🥇'
                        : `#${index + 1}`}
                    </div>

                    <div className="recommendation-main">
                      {/* Header */}

                      <div className="recommendation-header">
                        <div>
                          <h3>
                            {index === 0
                              ? 'Anbefalt oppsett'
                              : `Oppsett ${index + 1}`}
                          </h3>

                          <p>
                            {getSetupText(
                              recommendation.setup
                            )}
                          </p>
                        </div>

                        <div className="recommendation-win-rate">
                          <strong>
                            {
                              recommendation
                                .adjustedWinRate
                            }
                            %
                          </strong>

                          <span>
                            justert
                            seiersrate
                          </span>
                        </div>
                      </div>

                      {/* Statistikk */}

                      <div className="recommendation-stats">
                        <div>
                          <strong>
                            {
                              recommendation
                                .wins
                            }
                            /
                            {
                              recommendation
                                .comparisons
                            }
                          </strong>

                          <span>
                            faktiske
                            seire
                          </span>
                        </div>

                        <div>
                          <strong>
                            {
                              recommendation
                                .relevantSessionCount
                            }
                          </strong>

                          <span>
                            relevante
                            testøkter
                          </span>
                        </div>

                        <div>
                          <strong>
                            {
                              recommendation
                                .weightedAverageScore >
                              0
                                ? '+'
                                : ''
                            }

                            {
                              recommendation
                                .weightedAverageScore
                            }
                          </strong>

                          <span>
                            gj.snittscore
                          </span>
                        </div>

                        <div>
                          <strong>
                            {getConfidenceText(
                              recommendation
                                .dataConfidence
                            )}
                          </strong>

                          <span>
                            datatillit
                          </span>
                        </div>
                      </div>

                      {/* Datagrunnlag */}

                      <div className="recommendation-confidence">
                        <div className="recommendation-confidence-top">
                          <span>
                            Datagrunnlag
                          </span>

                          <span>
                            {
                              recommendation
                                .dataConfidence
                            }
                            %
                          </span>
                        </div>

                        <div className="recommendation-confidence-track">
                          <div
                            className="recommendation-confidence-value"
                            style={{
                              width:
                                `${recommendation.dataConfidence}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </article>
                )
              )}
            </div>
          )}
      </section>

      {/* =========================
          LIGNENDE TESTØKTER
      ========================= */}

      <section className="analysis-results">
        <div className="analysis-results-heading">
          <div>
            <h2>
              Lignende testøkter
            </h2>

            <p>
              Historiske tester
              sortert etter hvor
              like forholdene var.
            </p>
          </div>

          {hasConditions && (
            <span>
              {
                matchingSessions
                  .length
              }{' '}
              treff
            </span>
          )}
        </div>

        {/* Ingen forhold */}

        {!hasConditions && (
          <div className="panel analysis-empty">
            <p>
              Legg inn dagens forhold
              for å finne lignende
              tidligere tester.
            </p>
          </div>
        )}

        {/* Ingen historiske tester */}

        {hasConditions &&
          sessions.length === 0 && (
            <div className="panel analysis-empty">
              <h3>
                Ingen historiske
                tester ennå
              </h3>

              <p>
                Fullfør noen
                testøkter først.
              </p>
            </div>
          )}

        {/* Testøkter */}

        {hasConditions &&
          matchingSessions.length >
            0 && (
            <div className="analysis-match-list">
              {matchingSessions.map(
                ({
                  session,
                  similarity,
                }) => {
                  const winner =
                    getWinner(
                      session
                    )

                  return (
                    <article
                      key={
                        session.id
                      }
                      className="analysis-match-card"
                    >
                      {/* Header */}

                      <div className="analysis-match-top">
                        <div>
                          <h3>
                            {
                              session.title
                            }
                          </h3>

                          <p>
                            {session.location ||
                              'Sted ikke registrert'}
                          </p>
                        </div>

                        <div
                          className={
                            similarity >=
                            80
                              ? 'analysis-similarity analysis-similarity-high'
                              : similarity >=
                                  60
                                ? 'analysis-similarity analysis-similarity-medium'
                                : 'analysis-similarity'
                          }
                        >
                          <strong>
                            {
                              similarity
                            }
                            %
                          </strong>

                          <span>
                            likhet
                          </span>
                        </div>
                      </div>

                      {/* Forhold */}

                      <div className="analysis-match-conditions">
                        {session
                          .conditions
                          ?.airTemperature !==
                          null &&
                          session
                            .conditions
                            ?.airTemperature !==
                            undefined && (
                            <span>
                              🌡️{' '}
                              {
                                session
                                  .conditions
                                  .airTemperature
                              }{' '}
                              °C
                            </span>
                          )}

                        {session
                          .conditions
                          ?.snowTemperature !==
                          null &&
                          session
                            .conditions
                            ?.snowTemperature !==
                            undefined && (
                            <span>
                              ❄️{' '}
                              {
                                session
                                  .conditions
                                  .snowTemperature
                              }{' '}
                              °C
                            </span>
                          )}

                        {session
                          .conditions
                          ?.humidity !==
                          null &&
                          session
                            .conditions
                            ?.humidity !==
                            undefined && (
                            <span>
                              💧{' '}
                              {
                                session
                                  .conditions
                                  .humidity
                              }
                              %
                            </span>
                          )}

                        {session
                          .conditions
                          ?.snowType && (
                          <span>
                            {
                              session
                                .conditions
                                .snowType
                            }
                          </span>
                        )}

                        {session
                          .conditions
                          ?.snowCondition && (
                          <span>
                            {
                              session
                                .conditions
                                .snowCondition
                            }
                          </span>
                        )}

                        {session
                          .conditions
                          ?.weather && (
                          <span>
                            {
                              session
                                .conditions
                                .weather
                            }
                          </span>
                        )}
                      </div>

                      {/* Bunn */}

                      <div className="analysis-match-bottom">
                        <span className="analysis-match-date">
                          {
                            session.date ||
                            'Ingen dato'
                          }

                          {session.time &&
                            ` · ${session.time}`}
                        </span>

                        {winner && (
                          <div className="analysis-match-winner">
                            🏆 Ski{' '}
                            {
                              winner
                                .skiNumber
                            }
                          </div>
                        )}
                      </div>

                      {/* Link */}

                      <div className="analysis-match-actions">
                        <Link
                          to={`/historikk/${session.id}`}
                        >
                          Se testøkt
                        </Link>
                      </div>

                      {/* Likhetslinje */}

                      <div className="analysis-similarity-track">
                        <div
                          className="analysis-similarity-value"
                          style={{
                            width:
                              `${similarity}%`,
                          }}
                        />
                      </div>
                    </article>
                  )
                }
              )}
            </div>
          )}
      </section>
    </main>
  )
}

export default Analysis