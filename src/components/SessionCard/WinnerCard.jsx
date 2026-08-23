function WinnerCard({
  winner,
}) {
  if (!winner) {
    return null
  }

  return (
    <div className="session-winner">
      <h3>
        🏆 Vinner av testøkten
      </h3>

      <h2>
        Ski {winner.skiNumber}
      </h2>

      <p>
        <strong>
          Slip:
        </strong>{' '}
        {winner.grind ||
          'Ikke registrert'}
      </p>

      <p>
        <strong>
          Rill:
        </strong>{' '}
        {winner.rill ||
          'Ikke registrert'}
      </p>

      <p>
        <strong>
          Glider:
        </strong>{' '}
        {winner.glideWax ||
          'Ikke registrert'}
      </p>

      <p>
        <strong>
          Topping:
        </strong>{' '}
        {winner.topping ||
          'Ikke registrert'}
      </p>
    </div>
  )
}

export default WinnerCard