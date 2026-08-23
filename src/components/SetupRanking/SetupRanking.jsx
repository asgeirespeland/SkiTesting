function SetupRanking({ tests }) {
  if (tests.length === 0) {
    return null
  }

  const groupedSetups = tests.reduce((groups, test) => {
    const grind = test.grind || 'Ingen slip'
    const glideWax = test.glideWax || 'Ingen glider'
    const topping = test.topping || 'Ingen topping'

    const key = `${grind}-${glideWax}-${topping}`

    if (!groups[key]) {
      groups[key] = {
        grind,
        glideWax,
        topping,
        totalGlide: 0,
        totalFeeling: 0,
        count: 0,
      }
    }

    groups[key].totalGlide += Number(test.glideDifferenceCm)
    groups[key].totalFeeling += Number(test.feeling)
    groups[key].count += 1

    return groups
  }, {})

  const ranking = Object.values(groupedSetups)
    .map((setup) => ({
      ...setup,
      averageGlide: setup.totalGlide / setup.count,
      averageFeeling: setup.totalFeeling / setup.count,
    }))
    .sort((a, b) => b.averageGlide - a.averageGlide)

  return (
    <div>
      <h2>Beste oppsett</h2>

      {ranking.map((setup, index) => (
        <div
          key={`${setup.grind}-${setup.glideWax}-${setup.topping}`}
        >
          <h3>
            {index + 1}. {setup.grind}
          </h3>

          <p>Glider: {setup.glideWax}</p>
          <p>Topping: {setup.topping}</p>

          <p>
            Gjennomsnittlig glid:{' '}
            {setup.averageGlide > 0 ? '+' : ''}
            {setup.averageGlide.toFixed(1)} cm
          </p>

          <p>
            Gjennomsnittlig følelse:{' '}
            {setup.averageFeeling.toFixed(1)} / 5
          </p>

          <p>Antall tester: {setup.count}</p>
        </div>
      ))}
    </div>
  )
}

export default SetupRanking