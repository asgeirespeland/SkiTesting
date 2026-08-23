import {
  Link,
} from 'react-router-dom'

import { useState } from 'react'

import '../../styles/PageLayout.css'

function History({
  sessions,
  onReopenSession,
}) {
  const [
    searchTerm,
    setSearchTerm,
  ] = useState('')

  const completedSessions =
    sessions
      .filter(
        (session) =>
          session.status ===
          'completed'
      )

      .filter((session) => {
        const search =
          searchTerm
            .toLowerCase()
            .trim()

        if (!search) {
          return true
        }

        return (
          (session.title ?? '')
            .toLowerCase()
            .includes(search) ||

          (session.location ?? '')
            .toLowerCase()
            .includes(search) ||

          (
            session.conditions
              ?.snowType ?? ''
          )
            .toLowerCase()
            .includes(search) ||

          (
            session.conditions
              ?.snowCondition ?? ''
          )
            .toLowerCase()
            .includes(search)
        )
      })

      .sort((a, b) => {
        const dateA =
          `${a.date ?? ''}T${
            a.time ?? '00:00'
          }`

        const dateB =
          `${b.date ?? ''}T${
            b.time ?? '00:00'
          }`

        return dateB.localeCompare(
          dateA
        )
      })

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

    return session.skis.find(
      (ski) =>
        ski.id ===
        finalComparison.winnerId
    )
  }

  return (
    <div className="home">
      <header className="home-header">
        <div>
          <h1>Historikk</h1>

          <p>
            Ferdige testøkter og
            resultater
          </p>
        </div>
      </header>

      <section className="panel">
        <label>
          <strong>
            Søk i historikken
          </strong>
        </label>

        <input
          type="text"
          value={searchTerm}
          onChange={(event) =>
            setSearchTerm(
              event.target.value
            )
          }
          placeholder="Søk etter sted, testøkt eller snøforhold..."
          style={{
            width: '100%',
            marginTop: '8px',
            padding: '11px 12px',
            border:
              '1px solid #ccc',
            borderRadius: '8px',
          }}
        />
      </section>

      <div className="sessions-heading">
        <h2>
          Ferdige testøkter
        </h2>

        <span>
          {completedSessions.length}{' '}
          {completedSessions.length ===
          1
            ? 'testøkt'
            : 'testøkter'}
        </span>
      </div>

      {completedSessions.length ===
      0 ? (
        <section className="panel empty-sessions">
          <h3>
            Ingen ferdige testøkter
          </h3>

          <p>
            Når du fullfører en
            testøkt, dukker den opp
            her.
          </p>
        </section>
      ) : (
        <div className="history-list">
          {completedSessions.map(
            (session) => {
              const winner =
                getWinner(session)

              return (
                <section
                  className="panel"
                  key={session.id}
                >
                  <div className="session-header-top">
                    <div>
                      <h2>
                        {session.title}
                      </h2>

                      <p>
                        {session.location ||
                          'Sted ikke registrert'}
                      </p>
                    </div>

                    <div className="session-date">
                      <strong>
                        {session.date}
                      </strong>

                      {session.time && (
                        <span>
                          kl.{' '}
                          {session.time}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="session-conditions">
                    <span className="condition-badge">
                      🌡️{' '}
                      {
                        session.conditions
                          ?.airTemperature
                      }{' '}
                      °C
                    </span>

                    <span className="condition-badge">
                      ❄️{' '}
                      {
                        session.conditions
                          ?.snowTemperature
                      }{' '}
                      °C snø
                    </span>

                    <span className="condition-badge">
                      {
                        session.conditions
                          ?.snowType
                      }
                    </span>

                    <span className="condition-badge">
                      {
                        session.conditions
                          ?.snowCondition
                      }
                    </span>
                  </div>

                  <p>
                    <strong>
                      {
                        session.skis
                          .length
                      }
                    </strong>{' '}
                    ski ·{' '}
                    <strong>
                      {
                        session
                          .comparisons
                          .length
                      }
                    </strong>{' '}
                    sammenligninger
                  </p>

                  {winner && (
                    <p>
                      🏆{' '}
                      <strong>
                        Ski{' '}
                        {
                          winner.skiNumber
                        }
                      </strong>

                      {winner.grind &&
                        ` — ${winner.grind}`}
                    </p>
                  )}

                  <div
                    style={{
                      display: 'flex',
                      gap: '8px',
                      flexWrap: 'wrap',
                      marginTop: '18px',
                    }}
                  >
                    <Link
                      to={`/historikk/${session.id}`}
                      className="new-session-button"
                      style={{
                        textDecoration:
                          'none',
                      }}
                    >
                      Se detaljer
                    </Link>

                    <button
                      type="button"
                      className="close-form-button"
                      onClick={() => {
                        const confirmed =
                          window.confirm(
                            `Vil du åpne "${session.title}" igjen?\n\n` +
                              'Testøkten flyttes tilbake til aktive testøkter.'
                          )

                        if (
                          !confirmed
                        ) {
                          return
                        }

                        onReopenSession(
                          session.id
                        )
                      }}
                    >
                      Åpne igjen
                    </button>
                  </div>
                </section>
              )
            }
          )}
        </div>
      )}
    </div>
  )
}

export default History