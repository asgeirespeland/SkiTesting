import {
  useState,
} from 'react'

import ComparisonForm from '../ComparisonForm/ComparisonForm'
import SessionEditForm from '../SessionEditForm/SessionEditForm'

import SessionHeader from './SessionHeader'
import SkiSection from './SkiSection'
import WinnerCard from './WinnerCard'
import ComparisonHistory from './ComparisonHistory'

import {
  getTournamentState,
} from '../../utils/tournament'

import './SessionCard.css'

function SessionCard({
  session,
  defaultOpen = false,

  onAddSki,
  onUpdateSki,
  onDeleteSki,

  onUpdateSession,
  onDeleteSession,
  onCompleteSession,

  onAddComparison,
  onUpdateComparison,
  onDeleteComparison,
}) {
  const [
    isOpen,
    setIsOpen,
  ] = useState(
    defaultOpen
  )

  const [
    isEditingSession,
    setIsEditingSession,
  ] = useState(false)

  // =========================
  // TESTØKT
  // =========================

  function handleSaveSession(
    updatedSession
  ) {
    onUpdateSession(
      updatedSession
    )

    setIsEditingSession(false)
  }

  function handleDeleteSession() {
    const confirmed =
      window.confirm(
        `Er du sikker på at du vil slette "${session.title}"?\n\n` +
          'Alle ski og sammenligninger i denne testøkten blir også slettet.'
      )

    if (!confirmed) {
      return
    }

    onDeleteSession(
      session.id
    )
  }

  // =========================
  // NY SAMMENLIGNING
  // =========================

  function handleAddComparison(
    newComparison
  ) {
    onAddComparison(
      session.id,
      newComparison
    )
  }

  // =========================
  // TURNERINGSSTATUS
  // =========================

  const tournamentState =
    getTournamentState(
      session
    )

  const nextPair =
    tournamentState.nextPair

  const overallWinner =
    tournamentState.winnerId
      ? session.skis.find(
          (ski) =>
            String(ski.id) ===
            String(
              tournamentState.winnerId
            )
        )
      : null

  // =========================
  // FULLFØR TESTØKT
  // =========================

  function handleCompleteSession() {
    if (
      session.skis.length < 2
    ) {
      alert(
        'Du må registrere minst to ski før testøkten kan fullføres.'
      )

      return
    }

    if (!overallWinner) {
      alert(
        'Testingen er ikke ferdig ennå. ' +
          'Gjennomfør alle duellene før du fullfører testøkten.'
      )

      return
    }

    const confirmed =
      window.confirm(
        `Vil du fullføre "${session.title}"?\n\n` +
          `Vinner: Ski ${overallWinner.skiNumber}\n\n` +
          'Testøkten flyttes til Historikk.'
      )

    if (!confirmed) {
      return
    }

    onCompleteSession(
      session.id
    )
  }

  return (
    <div className="session-card">
      {/* =========================
          HEADER
      ========================= */}

      <SessionHeader
        session={session}

        isOpen={
          isOpen
        }

        isEditingSession={
          isEditingSession
        }

        onComplete={
          handleCompleteSession
        }

        onToggleEdit={() =>
          setIsEditingSession(
            !isEditingSession
          )
        }

        onDelete={
          handleDeleteSession
        }

        onToggleOpen={() =>
          setIsOpen(
            !isOpen
          )
        }
      />

      {/* =========================
          REDIGER TESTØKT
      ========================= */}

      {isEditingSession && (
        <div className="session-edit-panel">
          <SessionEditForm
            session={
              session
            }

            onSave={
              handleSaveSession
            }

            onCancel={() =>
              setIsEditingSession(
                false
              )
            }
          />
        </div>
      )}

      {/* =========================
          ÅPEN TESTØKT
      ========================= */}

      {isOpen && (
        <div>
          {/* =========================
              SKI
          ========================= */}

          <SkiSection
            session={
              session
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
          />

          {/* =========================
              TESTING
          ========================= */}

          {session.skis.length >=
            2 && (
            <div>
              <h3>
                Testing
              </h3>

              {/* Neste duell */}

              {nextPair && (
                <ComparisonForm
                  skis={
                    session.skis
                  }

                  suggestedPair={
                    nextPair
                  }

                  onAddComparison={
                    handleAddComparison
                  }
                />
              )}

              {/* Vinner */}

              <WinnerCard
                winner={
                  overallWinner
                }
              />

              {/* Historikk */}

              <ComparisonHistory
                session={
                  session
                }

                onUpdateComparison={
                  onUpdateComparison
                }

                onDeleteComparison={
                  onDeleteComparison
                }
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SessionCard