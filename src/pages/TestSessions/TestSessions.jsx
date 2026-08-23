import { useState } from 'react'
import { Link } from 'react-router-dom'

import SessionForm from '../../components/SessionForm/SessionForm'

import '../../styles/PageLayout.css'
import './TestSessions.css'

function TestSessions({
  sessions,
  onAddSession,
}) {
  const [
    showSessionForm,
    setShowSessionForm,
  ] = useState(false)

  const activeSessions = sessions
    .filter(
      (session) =>
        session.status !== 'completed'
    )
    .sort((a, b) => {
      const dateA =
        `${a.date ?? ''}T${a.time ?? '00:00'}`

      const dateB =
        `${b.date ?? ''}T${b.time ?? '00:00'}`

      return dateB.localeCompare(dateA)
    })

  function handleAddSession(newSession) {
    onAddSession(newSession)

    setShowSessionForm(false)
  }

  function getProgress(session) {
    const skiCount =
      session.skis?.length ?? 0

    const completedDuels =
      session.comparisons?.length ?? 0

    /*
     * En utslagsturnering med n ski
     * trenger n - 1 dueller.
     */
    const totalDuels =
      skiCount >= 2
        ? skiCount - 1
        : 0

    const percentage =
      totalDuels > 0
        ? Math.min(
            100,
            Math.round(
              (completedDuels /
                totalDuels) *
                100
            )
          )
        : 0

    return {
      completedDuels,
      totalDuels,
      percentage,
    }
  }

  return (
    <div className="home">
      <header className="home-header">
        <div>
          <h1>Testøkter</h1>

          <p>
            Aktive skitester
          </p>
        </div>

        {!showSessionForm && (
          <button
            className="new-session-button"
            onClick={() =>
              setShowSessionForm(true)
            }
          >
            + Ny testøkt
          </button>
        )}
      </header>

      {showSessionForm && (
        <section className="panel">
          <div className="new-session-header">
            <h2>Ny testøkt</h2>

            <button
              type="button"
              className="close-form-button"
              onClick={() =>
                setShowSessionForm(false)
              }
            >
              Avbryt
            </button>
          </div>

          <SessionForm
            onAddSession={
              handleAddSession
            }
          />
        </section>
      )}

      <div className="sessions-heading">
        <h2>Aktive testøkter</h2>

        <span>
          {activeSessions.length}{' '}
          {activeSessions.length === 1
            ? 'testøkt'
            : 'testøkter'}
        </span>
      </div>

      {activeSessions.length === 0 ? (
        <section className="panel empty-sessions">
          <h3>
            Ingen aktive testøkter
          </h3>

          <p>
            Opprett en ny testøkt for
            å komme i gang.
          </p>

          <button
            className="new-session-button"
            onClick={() =>
              setShowSessionForm(true)
            }
          >
            + Ny testøkt
          </button>
        </section>
      ) : (
        <div className="active-session-grid">
          {activeSessions.map(
            (session) => {
              const progress =
                getProgress(session)

              return (
                <article
                  className="active-session-card"
                  key={session.id}
                >
                  <div className="active-session-card-header">
                    <div>
                      <h2>
                        {session.title}
                      </h2>

                      <p>
                        {session.location ||
                          'Sted ikke registrert'}
                      </p>
                    </div>

                    <div className="active-session-date">
                      <strong>
                        {session.date ||
                          'Ingen dato'}
                      </strong>

                      {session.time && (
                        <span>
                          kl.{' '}
                          {session.time}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="active-session-conditions">
                    {session.conditions
                      ?.airTemperature !==
                      null &&
                      session.conditions
                        ?.airTemperature !==
                        undefined && (
                        <span>
                          🌡️{' '}
                          {
                            session.conditions
                              .airTemperature
                          }{' '}
                          °C
                        </span>
                      )}

                    {session.conditions
                      ?.snowTemperature !==
                      null &&
                      session.conditions
                        ?.snowTemperature !==
                        undefined && (
                        <span>
                          ❄️{' '}
                          {
                            session.conditions
                              .snowTemperature
                          }{' '}
                          °C
                        </span>
                      )}

                    {session.conditions
                      ?.snowType && (
                      <span>
                        {
                          session.conditions
                            .snowType
                        }
                      </span>
                    )}

                    {session.conditions
                      ?.snowCondition && (
                      <span>
                        {
                          session.conditions
                            .snowCondition
                        }
                      </span>
                    )}
                  </div>

                  <div className="active-session-stats">
                    <span>
                      <strong>
                        {session.skis?.length ??
                          0}
                      </strong>{' '}
                      ski
                    </span>

                    <span>·</span>

                    <span>
                      <strong>
                        {
                          progress.completedDuels
                        }
                      </strong>
                      /
                      <strong>
                        {
                          progress.totalDuels
                        }
                      </strong>{' '}
                      dueller
                    </span>
                  </div>

                  <div className="active-session-progress">
                    <div className="active-session-progress-top">
                      <span>
                        Fremdrift
                      </span>

                      <strong>
                        {
                          progress.percentage
                        }
                        %
                      </strong>
                    </div>

                    <div className="active-session-progress-track">
                      <div
                        className="active-session-progress-value"
                        style={{
                          width: `${progress.percentage}%`,
                        }}
                      />
                    </div>
                  </div>

                  <Link
                    className="active-session-open"
                    to={`/testokter/${session.id}`}
                  >
                    {progress.percentage ===
                    100
                      ? 'Se resultat'
                      : 'Fortsett testing'}
                  </Link>
                </article>
              )
            }
          )}
        </div>
      )}
    </div>
  )
}

export default TestSessions