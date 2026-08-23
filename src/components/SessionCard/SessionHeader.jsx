function SessionHeader({
  session,

  isOpen,
  isEditingSession,

  onToggleOpen,
  onToggleEdit,
  onDelete,
  onComplete,
}) {
  return (
    <div className="session-header">
      <div className="session-header-top">
        <div>
          <h2>{session.title}</h2>

          <p className="session-location">
            {session.location ||
              'Sted ikke registrert'}
          </p>
        </div>

        <div className="session-date">
          <strong>
            {session.date ||
              'Dato ikke registrert'}
          </strong>

          {session.time && (
            <span>
              kl. {session.time}
            </span>
          )}
        </div>
      </div>

      <div className="session-conditions">
        {session.conditions
          ?.airTemperature !== null &&
          session.conditions
            ?.airTemperature !==
            undefined && (
            <span className="condition-badge">
              🌡️{' '}
              {
                session.conditions
                  .airTemperature
              }{' '}
              °C
            </span>
          )}

        {session.conditions
          ?.snowTemperature !== null &&
          session.conditions
            ?.snowTemperature !==
            undefined && (
            <span className="condition-badge">
              ❄️{' '}
              {
                session.conditions
                  .snowTemperature
              }{' '}
              °C snø
            </span>
          )}

        {session.conditions?.humidity !==
          null &&
          session.conditions?.humidity !==
            undefined && (
            <span className="condition-badge">
              💧{' '}
              {
                session.conditions
                  .humidity
              }{' '}
              %
            </span>
          )}

        {session.conditions?.snowType && (
          <span className="condition-badge">
            {session.conditions.snowType}
          </span>
        )}

        {session.conditions
          ?.snowCondition && (
          <span className="condition-badge">
            {
              session.conditions
                .snowCondition
            }
          </span>
        )}

        {session.conditions?.weather && (
          <span className="condition-badge">
            {session.conditions.weather}
          </span>
        )}
      </div>

      <div className="session-header-bottom">
        <div className="session-stats">
          <span>
            <strong>
              {session.skis.length}
            </strong>{' '}
            ski
          </span>

          <span>·</span>

          <span>
            <strong>
              {
                session.comparisons
                  .length
              }
            </strong>{' '}
            {session.comparisons
              .length === 1
              ? 'sammenligning'
              : 'sammenligninger'}
          </span>
        </div>

        <div className="session-header-actions">
          <button
            type="button"
            className="complete-session-button"
            onClick={onComplete}
          >
            ✓ Fullfør økt
          </button>

          <button
            type="button"
            onClick={onToggleEdit}
          >
            {isEditingSession
              ? 'Lukk redigering'
              : 'Rediger økt'}
          </button>

          <button
            type="button"
            onClick={onDelete}
          >
            Slett økt
          </button>

          <button
            type="button"
            onClick={onToggleOpen}
          >
            {isOpen
              ? 'Lukk testøkt'
              : 'Åpne testøkt'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default SessionHeader