import './AnalysisPanel.css'

function AnalysisPanel({ sessions }) {
  const setupStats = {}

  function getSetupKey(ski) {
    return [
      ski.grind || 'Ingen slip',
      ski.rill || 'Ingen rill',
      ski.glideWax || 'Ingen glider',
      ski.topping || 'Ingen topping',
    ].join('|')
  }

  function createSetup(ski) {
    return {
      grind: ski.grind || 'Ikke registrert',
      rill: ski.rill || 'Ikke registrert',
      glideWax: ski.glideWax || 'Ikke registrert',
      topping: ski.topping || 'Ikke registrert',

      comparisons: 0,
      wins: 0,
      totalScore: 0,
    }
  }

  sessions.forEach((session) => {
    session.comparisons.forEach((comparison) => {
      const skiA = session.skis.find(
        (ski) => ski.id === comparison.skiAId
      )

      const skiB = session.skis.find(
        (ski) => ski.id === comparison.skiBId
      )

      if (!skiA || !skiB) {
        return
      }

      const keyA = getSetupKey(skiA)
      const keyB = getSetupKey(skiB)

      if (!setupStats[keyA]) {
        setupStats[keyA] = createSetup(skiA)
      }

      if (!setupStats[keyB]) {
        setupStats[keyB] = createSetup(skiB)
      }

      setupStats[keyA].comparisons += 1
      setupStats[keyB].comparisons += 1

      if (comparison.winnerId === skiA.id) {
        setupStats[keyA].wins += 1
      }

      if (comparison.winnerId === skiB.id) {
        setupStats[keyB].wins += 1
      }

      const calculatedScore =
        Number(comparison.calculatedScore) || 0

      // Positiv comparison-score betyr fordel Ski A.
      // For Ski B snur vi derfor fortegnet.
      setupStats[keyA].totalScore +=
        calculatedScore

      setupStats[keyB].totalScore -=
        calculatedScore
    })
  })

  const rankings = Object.values(setupStats)
    .map((setup) => ({
      ...setup,

      winRate:
        setup.comparisons > 0
          ? (setup.wins /
              setup.comparisons) *
            100
          : 0,

      averageScore:
        setup.comparisons > 0
          ? setup.totalScore /
            setup.comparisons
          : 0,
    }))
    .sort((a, b) => {
      if (b.winRate !== a.winRate) {
        return b.winRate - a.winRate
      }

      return (
        b.averageScore -
        a.averageScore
      )
    })

  const totalComparisons =
    sessions.reduce(
      (total, session) =>
        total +
        session.comparisons.length,
      0
    )

  return (
    <section className="analysis-panel">
      <div className="analysis-header">
        <div>
          <h2>Analyse</h2>

          <p>
            Resultater på tvers av
            testøktene
          </p>
        </div>

        <div className="analysis-summary">
          <span>
            <strong>
              {sessions.length}
            </strong>{' '}
            testøkter
          </span>

          <span>·</span>

          <span>
            <strong>
              {totalComparisons}
            </strong>{' '}
            dueller
          </span>
        </div>
      </div>

      {rankings.length === 0 ? (
        <div className="analysis-empty">
          <p>
            Ingen analysedata ennå.
          </p>

          <span>
            Gjennomfør noen
            sammenligninger først.
          </span>
        </div>
      ) : (
        <>
          <h3>Beste oppsett</h3>

          <div className="setup-ranking">
            {rankings
              .slice(0, 5)
              .map((setup, index) => (
                <div
                  className="setup-ranking-card"
                  key={`${setup.grind}-${setup.rill}-${setup.glideWax}-${setup.topping}`}
                >
                  <div className="setup-ranking-position">
                    #{index + 1}
                  </div>

                  <div className="setup-ranking-info">
                    <h4>
                      {setup.grind}
                    </h4>

                    <p>
                      {setup.rill} ·{' '}
                      {setup.glideWax} ·{' '}
                      {setup.topping}
                    </p>
                  </div>

                  <div className="setup-ranking-stats">
                    <div>
                      <strong>
                        {setup.wins}/
                        {
                          setup.comparisons
                        }
                      </strong>

                      <span>seire</span>
                    </div>

                    <div>
                      <strong>
                        {setup.winRate.toFixed(
                          0
                        )}
                        %
                      </strong>

                      <span>
                        seiersrate
                      </span>
                    </div>

                    <div>
                      <strong>
                        {setup.averageScore >
                        0
                          ? '+'
                          : ''}
                        {setup.averageScore.toFixed(
                          1
                        )}
                      </strong>

                      <span>
                        snittscore
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </>
      )}
    </section>
  )
}

export default AnalysisPanel