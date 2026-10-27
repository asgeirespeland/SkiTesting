import {
  useMemo,
  useState,
} from 'react'

import {
  Link,
} from 'react-router-dom'

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

import {
  calculateRecommendationScore,
} from '../../utils/recommendationScore'

import '../../styles/PageLayout.css'
import './Analysis.css'

// =========================
// HJELPEFUNKSJONER
// =========================

function hasValue(
  value
) {
  return (
    value !== '' &&
    value !== null &&
    value !== undefined
  )
}

function toNumberOrNull(
  value
) {
  if (!hasValue(value)) {
    return null
  }

  const number =
    Number(value)

  return Number.isNaN(
    number
  )
    ? null
    : number
}

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
// VINNER AV TEST
// =========================

function getWinner(
  session
) {
  const comparisons =
    session.comparisons ?? []

  const skis =
    session.skis ?? []

  if (
    comparisons.length === 0
  ) {
    return null
  }

  const highestRound =
    Math.max(
      ...comparisons.map(
        (comparison) =>
          Number(
            comparison.round
          ) || 0
      )
    )

  const finalComparison =
    comparisons.find(
      (comparison) =>
        Number(
          comparison.round
        ) === highestRound
    )

  if (
    !finalComparison?.winnerId
  ) {
    return null
  }

  return (
    skis.find(
      (ski) =>
        idsAreEqual(
          ski.id,
          finalComparison.winnerId
        )
    ) ?? null
  )
}

// =========================
// OPPSETT-TEKST
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

  if (
    parts.length === 0
  ) {
    return 'Ingen oppsettdata'
  }

  return parts.join(' • ')
}

// =========================
// DATATILLIT
// =========================

function getConfidenceText(
  confidence
) {
  if (
    confidence >= 75
  ) {
    return 'Høy'
  }

  if (
    confidence >= 40
  ) {
    return 'Middels'
  }

  return 'Lav'
}

// =========================
// TEMPERATUR
// =========================

function equipmentHasTemperatureRange(
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

function isTemperatureMatch(
  item,
  snowTemperature
) {
  if (
    !item ||
    snowTemperature === null
  ) {
    return null
  }

  if (
    !equipmentHasTemperatureRange(
      item
    )
  ) {
    return null
  }

  return (
    snowTemperature >=
      Number(
        item.minTemperature
      ) &&
    snowTemperature <=
      Number(
        item.maxTemperature
      )
  )
}

// =========================
// ANALYSE
// =========================

function Analysis({
  sessions = [],
  equipment = [],
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

  function handleChange(
    event
  ) {
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
  // NORMALISERTE FORHOLD
  // =========================

  const analysisConditions =
    useMemo(
      () => ({
        airTemperature:
          toNumberOrNull(
            conditions.airTemperature
          ),

        snowTemperature:
          toNumberOrNull(
            conditions.snowTemperature
          ),

        humidity:
          toNumberOrNull(
            conditions.humidity
          ),

        snowType:
          conditions.snowType,

        snowCondition:
          conditions.snowCondition,

        weather:
          conditions.weather,
      }),
      [conditions]
    )

  const snowTemperature =
    analysisConditions
      .snowTemperature

  // =========================
  // LIGNENDE TESTØKTER
  // =========================

  const matchingSessions =
    useMemo(
      () =>
        sessions
          .map(
            (session) => ({
              session,

              similarity:
                calculateConditionSimilarity(
                  session.conditions ??
                    {},
                  analysisConditions
                ),
            })
          )
          .filter(
            (item) =>
              item.similarity >
              0
          )
          .sort(
            (a, b) =>
              b.similarity -
              a.similarity
          ),
      [
        sessions,
        analysisConditions,
      ]
    )

  // =========================
  // HISTORISKE ANBEFALINGER
  // =========================

  const recommendations =
    useMemo(
      () =>
        getSetupRecommendations({
          sessions,

          conditions:
            analysisConditions,

          minimumSimilarity:
            50,
        }),
      [
        sessions,
        analysisConditions,
      ]
    )

  // =========================
  // SAMLET RANGERING
  // =========================

  const scoredRecommendations =
    useMemo(
      () =>
        recommendations
          .map(
            (
              recommendation
            ) => {
              const score =
                calculateRecommendationScore({
                  recommendation,

                  equipment,

                  snowTemperature,
                })

              return {
                ...recommendation,

                ...score,
              }
            }
          )
          .sort(
            (a, b) => {
              if (
                b.combinedScore !==
                a.combinedScore
              ) {
                return (
                  b.combinedScore -
                  a.combinedScore
                )
              }

              return (
                b.adjustedWinRate -
                a.adjustedWinRate
              )
            }
          ),
      [
        recommendations,
        equipment,
        snowTemperature,
      ]
    )

  // =========================
  // GLIDER/TOPPING FRA KATALOG
  // =========================

  const temperatureEquipment =
    useMemo(() => {
      if (
        snowTemperature ===
        null
      ) {
        return []
      }

      return equipment
        .filter(
          (item) =>
            (
              item.type ===
                'glideWax' ||
              item.type ===
                'topping'
            ) &&
            isTemperatureMatch(
              item,
              snowTemperature
            ) === true
        )
        .sort(
          (a, b) => {
            if (
              a.type !== b.type
            ) {
              return (
                a.type ===
                'glideWax'
                  ? -1
                  : 1
              )
            }

            return (
              a.name?.localeCompare(
                b.name,
                'nb'
              ) ?? 0
            )
          }
        )
    }, [
      equipment,
      snowTemperature,
    ])

  // =========================
  // FINN UTSTYR FRA ID
  // =========================

  function findEquipment(
    id
  ) {
    if (!id) {
      return null
    }

    return (
      equipment.find(
        (item) =>
          idsAreEqual(
            item.id,
            id
          )
      ) ?? null
    )
  }

  // =========================
  // TEMPERATURSTATUS FOR OPPSETT
  // =========================

  function getRecommendationTemperatureStatus(
    recommendation
  ) {
    if (
      snowTemperature ===
      null
    ) {
      return {
        status:
          'unknown',

        text:
          'Oppgi snøtemperatur',
      }
    }

    const glideWax =
      findEquipment(
        recommendation.setup
          .glideWaxId
      )

    const topping =
      findEquipment(
        recommendation.setup
          .toppingId
      )

    const relevantItems = [
      glideWax,
      topping,
    ].filter(Boolean)

    if (
      relevantItems.length ===
      0
    ) {
      return {
        status:
          'unknown',

        text:
          'Ingen temperaturdata',
      }
    }

    const itemsWithRange =
      relevantItems.filter(
        equipmentHasTemperatureRange
      )

    if (
      itemsWithRange.length ===
      0
    ) {
      return {
        status:
          'unknown',

        text:
          'Ingen temperaturdata',
      }
    }

    const allMatch =
      itemsWithRange.every(
        (item) =>
          isTemperatureMatch(
            item,
            snowTemperature
          )
      )

    if (allMatch) {
      return {
        status:
          'match',

        text:
          'Innenfor temperaturområde',
      }
    }

    return {
      status:
        'outside',

      text:
        'Utenfor temperaturområde',
    }
  }

  // =========================
  // VISNING
  // =========================

  return (
    <main className="home">
      <header className="home-header">
        <div>
          <h1>
            Analyse
          </h1>

          <p>
            Finn relevante
            testøkter og oppsett
            for dagens forhold.
          </p>
        </div>
      </header>

      {/* =====================
          DAGENS FORHOLD
      ===================== */}

      <section className="panel">
        <h2>
          Dagens forhold
        </h2>

        <p className="analysis-section-description">
          Jo flere forhold du
          fyller inn, desto bedre
          kan tidligere tester
          sammenlignes.
        </p>

        <div className="analysis-condition-grid">
          <div>
            <label>
              Lufttemperatur
            </label>

            <input
              type="number"
              step="0.1"
              name="airTemperature"
              value={
                conditions.airTemperature
              }
              onChange={
                handleChange
              }
              placeholder="-5"
            />
          </div>

          <div>
            <label>
              Snøtemperatur
            </label>

            <input
              type="number"
              step="0.1"
              name="snowTemperature"
              value={
                conditions.snowTemperature
              }
              onChange={
                handleChange
              }
              placeholder="-7"
            />
          </div>

          <div>
            <label>
              Luftfuktighet
            </label>

            <input
              type="number"
              min="0"
              max="100"
              name="humidity"
              value={
                conditions.humidity
              }
              onChange={
                handleChange
              }
              placeholder="70"
            />
          </div>

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
                    key={
                      option
                    }
                    value={
                      option
                    }
                  >
                    {
                      option
                    }
                  </option>
                )
              )}
            </select>
          </div>

          <div>
            <label>
              Snøforhold
            </label>

            <select
              name="snowCondition"
              value={
                conditions.snowCondition
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
                    key={
                      option
                    }
                    value={
                      option
                    }
                  >
                    {
                      option
                    }
                  </option>
                )
              )}
            </select>
          </div>

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
                    key={
                      option
                    }
                    value={
                      option
                    }
                  >
                    {
                      option
                    }
                  </option>
                )
              )}
            </select>
          </div>
        </div>
      </section>

      {/* =====================
          TEMPERATURMATCH
      ===================== */}

      <section className="analysis-section">
        <div className="analysis-section-heading">
          <div>
            <h2>
              Utstyr for temperaturen
            </h2>

            <p>
              Glider og topping
              fra katalogen som
              dekker oppgitt
              snøtemperatur.
            </p>
          </div>
        </div>

        {snowTemperature ===
        null ? (
          <div className="panel analysis-empty">
            <p>
              Oppgi
              snøtemperatur over
              for å se passende
              produkter.
            </p>
          </div>
        ) : temperatureEquipment.length ===
          0 ? (
          <div className="panel analysis-empty">
            <p>
              Ingen registrerte
              glidere eller
              toppinger dekker{' '}
              <strong>
                {
                  snowTemperature
                }{' '}
                °C
              </strong>
              .
            </p>
          </div>
        ) : (
          <div className="analysis-temperature-grid">
            {temperatureEquipment.map(
              (item) => (
                <article
                  key={
                    item.id
                  }
                  className="analysis-temperature-card"
                >
                  <span className="analysis-temperature-type">
                    {item.type ===
                    'glideWax'
                      ? 'Glider'
                      : 'Topping'}
                  </span>

                  <h3>
                    {item.brand
                      ? `${item.brand} ${item.name}`
                      : item.name}
                  </h3>

                  <p>
                    🌡️{' '}
                    {
                      item.minTemperature
                    }{' '}
                    til{' '}
                    {
                      item.maxTemperature
                    }{' '}
                    °C
                  </p>

                  <strong>
                    Passer ved{' '}
                    {
                      snowTemperature
                    }{' '}
                    °C
                  </strong>
                </article>
              )
            )}
          </div>
        )}
      </section>

      {/* =====================
          ANBEFALTE OPPSETT
      ===================== */}

      <section className="analysis-section">
        <div className="analysis-section-heading">
          <div>
            <h2>
              Anbefalte oppsett
            </h2>

            <p>
              Basert på
              gjennomførte tester
              med minst 50 %
              likhet i forhold.
            </p>
          </div>

          <span>
            {
              scoredRecommendations.length
            }{' '}
            oppsett
          </span>
        </div>

        {scoredRecommendations.length ===
        0 ? (
          <div className="panel analysis-empty">
            <p>
              Ikke nok relevant
              testdata ennå.
            </p>
          </div>
        ) : (
          <div className="analysis-recommendation-grid">
            {scoredRecommendations.map(
              (
                recommendation,
                index
              ) => {
                const temperatureStatus =
                  getRecommendationTemperatureStatus(
                    recommendation
                  )

                return (
                  <article
                    key={
                      recommendation.setupKey
                    }
                    className="analysis-recommendation-card"
                  >
                    <div className="analysis-recommendation-top">
                      <span>
                        #{index + 1}
                      </span>

                      <strong>
                        {recommendation.combinedScore.toFixed(
                          0
                        )}
                        %
                      </strong>
                    </div>

                    <h3>
                      {getSetupText(
                        recommendation.setup
                      )}
                    </h3>

                    <div className="analysis-score-breakdown">
                      <span>
                        Testhistorikk:{' '}
                        <strong>
                          {recommendation.historicalScore.toFixed(
                            0
                          )}
                          %
                        </strong>
                      </span>

                      <span>
                        Temperatur:{' '}
                        <strong>
                          {recommendation.temperatureScore ===
                          null
                            ? 'Ingen data'
                            : `${recommendation.temperatureScore.toFixed(
                                0
                              )}%`}
                        </strong>
                      </span>
                    </div>

                    <div
                      className={`analysis-temperature-status ${temperatureStatus.status}`}
                    >
                      {temperatureStatus.status ===
                        'match' &&
                        '✓ '}

                      {temperatureStatus.status ===
                        'outside' &&
                        '⚠ '}

                      {
                        temperatureStatus.text
                      }
                    </div>

                    <div className="analysis-recommendation-stats">
                      <p>
                        <strong>
                          Seire:
                        </strong>{' '}
                        {
                          recommendation.wins
                        }
                        /
                        {
                          recommendation.comparisons
                        }
                      </p>

                      <p>
                        <strong>
                          Testøkter:
                        </strong>{' '}
                        {
                          recommendation.relevantSessionCount
                        }
                      </p>

                      <p>
                        <strong>
                          Gj.snittscore:
                        </strong>{' '}
                        {recommendation.weightedAverageScore.toFixed(
                          1
                        )}
                      </p>

                      <p>
                        <strong>
                          Datatillit:
                        </strong>{' '}
                        {getConfidenceText(
                          recommendation.dataConfidence
                        )}
                      </p>
                    </div>

                    <div className="analysis-confidence">
                      <div
                        className="analysis-confidence-bar"
                        style={{
                          width: `${recommendation.dataConfidence}%`,
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

      {/* =====================
          LIGNENDE TESTØKTER
      ===================== */}

      <section className="analysis-section">
        <div className="analysis-section-heading">
          <div>
            <h2>
              Lignende testøkter
            </h2>

            <p>
              Historiske tester
              sortert etter hvor
              like forholdene er.
            </p>
          </div>

          <span>
            {
              matchingSessions.length
            }{' '}
            tester
          </span>
        </div>

        {matchingSessions.length ===
        0 ? (
          <div className="panel analysis-empty">
            <p>
              Ingen relevante
              testøkter funnet.
            </p>
          </div>
        ) : (
          <div className="analysis-session-grid">
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
                    className="analysis-session-card"
                  >
                    <div className="analysis-session-card-top">
                      <div>
                        <h3>
                          {
                            session.title
                          }
                        </h3>

                        <p>
                          {session.location ||
                            'Ukjent sted'}
                        </p>
                      </div>

                      <strong>
                        {
                          similarity
                        }{' '}
                        %
                      </strong>
                    </div>

                    <div className="analysis-session-meta">
                      <span>
                        {
                          session.date
                        }
                      </span>

                      {hasValue(
                        session
                          .conditions
                          ?.snowTemperature
                      ) && (
                        <span>
                          Snø:{' '}
                          {
                            session
                              .conditions
                              .snowTemperature
                          }{' '}
                          °C
                        </span>
                      )}

                      <span>
                        {
                          session.skis
                            ?.length ??
                          0
                        }{' '}
                        ski
                      </span>
                    </div>

                    {winner && (
                      <p className="analysis-session-winner">
                        🏆 Ski{' '}
                        {
                          winner.skiNumber
                        }
                        {' – '}
                        {getSetupText(
                          winner
                        )}
                      </p>
                    )}

                    <Link
                      to={`/historikk/${session.id}`}
                      className="analysis-session-link"
                    >
                      Se testøkt
                    </Link>
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