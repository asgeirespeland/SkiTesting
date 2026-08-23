import {
  Link,
  Navigate,
  useParams,
} from 'react-router-dom'

import SessionCard from '../../components/SessionCard/SessionCard'

import './TestSessionDetail.css'

function TestSessionDetail({
  sessions,

  onUpdateSession,
  onDeleteSession,
  onCompleteSession,

  onAddSki,
  onUpdateSki,
  onDeleteSki,

  onAddComparison,
  onUpdateComparison,
  onDeleteComparison,
}) {
  const { sessionId } = useParams()

  const session = sessions.find(
    (item) =>
      String(item.id) === String(sessionId)
  )

  // =========================
  // TESTØKT FINNES IKKE
  // =========================

  if (!session) {
    return (
      <div className="test-session-detail">
        <Link
          className="test-session-back"
          to="/testokter"
        >
          ← Tilbake til testøkter
        </Link>

        <section className="test-session-not-found">
          <h1>Fant ikke testøkten</h1>

          <p>
            Testøkten kan ha blitt slettet.
          </p>
        </section>
      </div>
    )
  }

  // =========================
  // FERDIG TEST
  // =========================

  /*
   * Når brukeren trykker
   * "Fullfør økt" i SessionCard,
   * endres status til completed.
   *
   * Da sender vi automatisk brukeren
   * til detaljsiden i Historikk.
   */

  if (session.status === 'completed') {
    return (
      <Navigate
        to={`/historikk/${session.id}`}
        replace
      />
    )
  }

  // =========================
  // FREMDRIFT
  // =========================

  const skiCount =
    session.skis?.length ?? 0

  const completedDuels =
    session.comparisons?.length ?? 0

  /*
   * En utslagsturnering trenger alltid
   * n - 1 dueller for å finne én vinner.
   *
   * 2 ski  -> 1 duell
   * 4 ski  -> 3 dueller
   * 8 ski  -> 7 dueller
   */
  const totalDuels =
    skiCount >= 2
      ? skiCount - 1
      : 0

  const progressPercentage =
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

  // =========================
  // STATUS-TEKST
  // =========================

  function getProgressText() {
    if (skiCount === 0) {
      return 'Legg til minst to ski for å starte testingen.'
    }

    if (skiCount === 1) {
      return 'Legg til én ski til for å starte testingen.'
    }

    if (completedDuels === 0) {
      return 'Skiene er klare. Start første duell.'
    }

    if (
      completedDuels < totalDuels
    ) {
      const remaining =
        totalDuels -
        completedDuels

      return `${remaining} ${
        remaining === 1
          ? 'duell gjenstår'
          : 'dueller gjenstår'
      }.`
    }

    return 'Testingen er ferdig. Du kan nå fullføre testøkten.'
  }

  return (
    <main className="test-session-detail">
      {/* =========================
          TOPP
      ========================= */}

      <div className="test-session-detail-top">
        <Link
          className="test-session-back"
          to="/testokter"
        >
          ← Tilbake til testøkter
        </Link>

        <span className="test-session-active-badge">
          Aktiv testøkt
        </span>
      </div>

      {/* =========================
          FREMDRIFT
      ========================= */}

      <section className="test-progress">
        <div className="test-progress-header">
          <div>
            <span className="test-progress-label">
              Fremdrift
            </span>

            <h2>
              {progressPercentage} %
            </h2>
          </div>

          <div className="test-progress-stats">
            <div>
              <strong>
                {skiCount}
              </strong>

              <span>ski</span>
            </div>

            <div>
              <strong>
                {completedDuels}
                /
                {totalDuels}
              </strong>

              <span>dueller</span>
            </div>
          </div>
        </div>

        <div className="test-progress-track">
          <div
            className="test-progress-value"
            style={{
              width:
                `${progressPercentage}%`,
            }}
          />
        </div>

        <p className="test-progress-message">
          {getProgressText()}
        </p>
      </section>

      {/* =========================
          SELVE TESTEN
      ========================= */}

      <SessionCard
        session={session}
        defaultOpen={true}

        onUpdateSession={
          onUpdateSession
        }

        onDeleteSession={
          onDeleteSession
        }

        onCompleteSession={
          onCompleteSession
        }

        onAddSki={
          onAddSki
        }

        onUpdateSki={
          onUpdateSki
        }

        onDeleteSki={
          onDeleteSki
        }

        onAddComparison={
          onAddComparison
        }

        onUpdateComparison={
          onUpdateComparison
        }

        onDeleteComparison={
          onDeleteComparison
        }
      />
    </main>
  )
}

export default TestSessionDetail