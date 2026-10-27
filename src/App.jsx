import {
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'

import {
  useEffect,
  useState,
} from 'react'

import Navigation from './components/Navigation/Navigation'

import TestSessions from './pages/TestSessions/TestSessions'
import TestSessionDetail from './pages/TestSessionDetail/TestSessionDetail'
import History from './pages/History/History'
import HistoryDetail from './pages/HistoryDetail/HistoryDetail'
import Analysis from './pages/Analysis/Analysis'
import Equipment from './pages/Equipment/Equipment'

function App() {
  // =========================
  // TESTØKTER
  // =========================

  const [
    sessions,
    setSessions,
  ] = useState(() => {
    const savedSessions =
      localStorage.getItem(
        'skiSessions'
      )

    if (savedSessions) {
      return JSON.parse(
        savedSessions
      )
    }

    return []
  })

  // =========================
  // UTSTYR
  // =========================

  const [
    equipment,
    setEquipment,
  ] = useState(() => {
    const savedEquipment =
      localStorage.getItem(
        'skiEquipment'
      )

    if (savedEquipment) {
      return JSON.parse(
        savedEquipment
      )
    }

    return []
  })

  // =========================
  // LAGRE TESTØKTER
  // =========================

  useEffect(() => {
    localStorage.setItem(
      'skiSessions',
      JSON.stringify(
        sessions
      )
    )
  }, [sessions])

  // =========================
  // LAGRE UTSTYR
  // =========================

  useEffect(() => {
    localStorage.setItem(
      'skiEquipment',
      JSON.stringify(
        equipment
      )
    )
  }, [equipment])

  // =========================
  // TESTØKTER
  // =========================

  function addSession(
    newSession
  ) {
    setSessions(
      (currentSessions) => [
        ...currentSessions,
        newSession,
      ]
    )
  }

  function updateSession(
    updatedSession
  ) {
    setSessions(
      (currentSessions) =>
        currentSessions.map(
          (session) =>
            session.id ===
            updatedSession.id
              ? updatedSession
              : session
        )
    )
  }

  function deleteSession(
    sessionId
  ) {
    setSessions(
      (currentSessions) =>
        currentSessions.filter(
          (session) =>
            session.id !==
            sessionId
        )
    )
  }

  function completeSession(
    sessionId
  ) {
    setSessions(
      (currentSessions) =>
        currentSessions.map(
          (session) =>
            session.id ===
            sessionId
              ? {
                  ...session,

                  status:
                    'completed',

                  completedAt:
                    new Date()
                      .toISOString(),
                }
              : session
        )
    )
  }

  function reopenSession(
    sessionId
  ) {
    setSessions(
      (currentSessions) =>
        currentSessions.map(
          (session) =>
            session.id ===
            sessionId
              ? {
                  ...session,

                  status:
                    'active',

                  completedAt:
                    null,
                }
              : session
        )
    )
  }
  

  // =========================
  // SKI
  // =========================

  function addSkiToSession(
    sessionId,
    newSki
  ) {
    setSessions(
      (currentSessions) =>
        currentSessions.map(
          (session) => {
            if (
              session.id !==
              sessionId
            ) {
              return session
            }

            return {
              ...session,

              skis: [
                ...session.skis,
                newSki,
              ],

              /*
               * Hvis en ski legges til
               * etter at testingen har
               * startet, må turneringen
               * bygges opp på nytt.
               */
              comparisons: [],
            }
          }
        )
    )
  }

  function updateSkiInSession(
    sessionId,
    updatedSki
  ) {
    setSessions(
      (currentSessions) =>
        currentSessions.map(
          (session) => {
            if (
              session.id !==
              sessionId
            ) {
              return session
            }

            const oldSki =
              session.skis.find(
                (ski) =>
                  ski.id ===
                  updatedSki.id
              )

            if (!oldSki) {
              return session
            }

            // =====================
            // HAR TESTRELEVANTE DATA
            // BLITT ENDRET?
            // =====================

            const skiChanged =
              Number(
                oldSki.skiNumber
              ) !==
                Number(
                  updatedSki.skiNumber
                ) ||

              String(
                oldSki.grindId ?? ''
              ) !==
                String(
                  updatedSki.grindId ??
                    ''
                ) ||

              String(
                oldSki.rillId ?? ''
              ) !==
                String(
                  updatedSki.rillId ??
                    ''
                ) ||

              String(
                oldSki.glideWaxId ??
                  ''
              ) !==
                String(
                  updatedSki.glideWaxId ??
                    ''
                ) ||

              String(
                oldSki.toppingId ??
                  ''
              ) !==
                String(
                  updatedSki.toppingId ??
                    ''
                ) ||

              (oldSki.grind ?? '') !==
                (
                  updatedSki.grind ??
                  ''
                ) ||

              (oldSki.rill ?? '') !==
                (
                  updatedSki.rill ??
                  ''
                ) ||

              (oldSki.glideWax ??
                '') !==
                (
                  updatedSki.glideWax ??
                  ''
                ) ||

              (oldSki.topping ??
                '') !==
                (
                  updatedSki.topping ??
                  ''
                )

            return {
              ...session,

              skis:
                session.skis.map(
                  (ski) =>
                    ski.id ===
                    updatedSki.id
                      ? updatedSki
                      : ski
                ),

              /*
               * Hvis oppsettet endres,
               * er gamle sammenligninger
               * ikke lenger gyldige.
               */
              comparisons:
                skiChanged
                  ? []
                  : session.comparisons,
            }
          }
        )
    )
  }

  function deleteSkiFromSession(
    sessionId,
    skiId
  ) {
    setSessions(
      (currentSessions) =>
        currentSessions.map(
          (session) => {
            if (
              session.id !==
              sessionId
            ) {
              return session
            }

            return {
              ...session,

              skis:
                session.skis.filter(
                  (ski) =>
                    ski.id !==
                    skiId
                ),

              comparisons: [],
            }
          }
        )
    )
  }

  // =========================
  // SAMMENLIGNINGER
  // =========================

  function addComparisonToSession(
    sessionId,
    newComparison
  ) {
    setSessions(
      (currentSessions) =>
        currentSessions.map(
          (session) => {
            if (
              session.id !==
              sessionId
            ) {
              return session
            }

            return {
              ...session,

              comparisons: [
                ...session.comparisons,
                newComparison,
              ],
            }
          }
        )
    )
  }

  function updateComparisonInSession(
    sessionId,
    updatedComparison
  ) {
    setSessions(
      (currentSessions) =>
        currentSessions.map(
          (session) => {
            if (
              session.id !==
              sessionId
            ) {
              return session
            }

            const oldComparison =
              session.comparisons.find(
                (comparison) =>
                  comparison.id ===
                  updatedComparison.id
              )

            if (!oldComparison) {
              return session
            }

            const winnerChanged =
              oldComparison.winnerId !==
              updatedComparison.winnerId

            /*
             * Hvis vinneren av en
             * tidligere duell endres,
             * er senere runder ikke
             * lenger gyldige.
             */
            if (winnerChanged) {
              return {
                ...session,

                comparisons:
                  session.comparisons
                    .filter(
                      (comparison) =>
                        comparison.round <=
                        oldComparison.round
                    )
                    .map(
                      (comparison) =>
                        comparison.id ===
                        updatedComparison.id
                          ? updatedComparison
                          : comparison
                    ),
              }
            }

            return {
              ...session,

              comparisons:
                session.comparisons.map(
                  (comparison) =>
                    comparison.id ===
                    updatedComparison.id
                      ? updatedComparison
                      : comparison
                ),
            }
          }
        )
    )
  }

  function deleteComparisonFromSession(
    sessionId,
    comparisonId
  ) {
    setSessions(
      (currentSessions) =>
        currentSessions.map(
          (session) => {
            if (
              session.id !==
              sessionId
            ) {
              return session
            }

            const deletedComparison =
              session.comparisons.find(
                (comparison) =>
                  comparison.id ===
                  comparisonId
              )

            if (
              !deletedComparison
            ) {
              return session
            }

            /*
             * Hvis vi sletter en duell,
             * slettes også senere runder.
             */
            return {
              ...session,

              comparisons:
                session.comparisons.filter(
                  (comparison) =>
                    comparison.id !==
                      comparisonId &&
                    comparison.round <=
                      deletedComparison.round
                ),
            }
          }
        )
    )
  }

  // =========================
  // UTSTYR
  // =========================

  function addEquipment(
    newEquipment
  ) {
    setEquipment(
      (currentEquipment) => [
        ...currentEquipment,
        newEquipment,
      ]
    )
  }

  function updateEquipment(
    updatedEquipment
  ) {
    setEquipment(
      (currentEquipment) =>
        currentEquipment.map(
          (item) =>
            item.id ===
            updatedEquipment.id
              ? updatedEquipment
              : item
        )
    )
  }

  function deleteEquipment(
    equipmentId
  ) {
    setEquipment(
      (currentEquipment) =>
        currentEquipment.filter(
          (item) =>
            item.id !==
            equipmentId
        )
    )
  }

  // =========================
  // FERDIGE TESTER TIL ANALYSE
  // =========================

  const completedSessions =
    sessions.filter(
      (session) =>
        session.status ===
        'completed'
    )

  // =========================
  // ROUTES
  // =========================

  return (
    <>
      <Navigation />

      <Routes>
        {/* =====================
            FORSIDE
        ===================== */}

        <Route
          path="/"
          element={
            <Navigate
              to="/testokter"
              replace
            />
          }
        />

        {/* =====================
            TESTØKTER
        ===================== */}

        <Route
          path="/testokter"
          element={
            <TestSessions
              sessions={
                sessions
              }
              onAddSession={
                addSession
              }
            />
          }
        />

        <Route
          path="/testokter/:sessionId"
          element={
            <TestSessionDetail
              sessions={sessions}
              equipment={equipment}

              onUpdateSession={
                updateSession
              }

              onDeleteSession={
                deleteSession
              }

              onCompleteSession={
                completeSession
              }

              onAddSki={
                addSkiToSession
              }

              onUpdateSki={
                updateSkiInSession
              }

              onDeleteSki={
                deleteSkiFromSession
              }

              onAddComparison={
                addComparisonToSession
              }

              onUpdateComparison={
                updateComparisonInSession
              }

              onDeleteComparison={
                deleteComparisonFromSession
              }
            />
          }
        />

        {/* =====================
            HISTORIKK
        ===================== */}

        <Route
          path="/historikk"
          element={
            <History
              sessions={
                sessions
              }

              onReopenSession={
                reopenSession
              }
            />
          }
        />

        <Route
          path="/historikk/:sessionId"
          element={
            <HistoryDetail
              sessions={
                sessions
              }
            />
          }
        />

        {/* =====================
            ANALYSE
        ===================== */}

        <Route
          path="/analyse"
          element={
            <Analysis
              sessions={
                completedSessions
              }
              equipment={
                equipment
              }
            />
          }
        />

        {/* =====================
            UTSTYR
        ===================== */}

        <Route
          path="/utstyr"
          element={
            <Equipment
              equipment={
                equipment
              }

              onAddEquipment={
                addEquipment
              }

              onUpdateEquipment={
                updateEquipment
              }

              onDeleteEquipment={
                deleteEquipment
              }
            />
          }
        />

        {/* =====================
            UKJENT URL
        ===================== */}

        <Route
          path="*"
          element={
            <Navigate
              to="/testokter"
              replace
            />
          }
        />
      </Routes>
    </>
  )
}

export default App