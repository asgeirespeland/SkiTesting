import { useState } from 'react'

import SkiForm from '../SkiForm/SkiForm'

function SkiSection({
  session,

  onAddSki,
  onUpdateSki,
  onDeleteSki,
}) {
  const [
    editingSkiId,
    setEditingSkiId,
  ] = useState(null)

  const [
    editedSki,
    setEditedSki,
  ] = useState(null)

  // =========================
  // LEGG TIL SKI
  // =========================

  function handleAddSki(newSki) {
    if (
      session.comparisons.length > 0
    ) {
      const confirmed =
        window.confirm(
          'Du har allerede startet testingen.\n\n' +
            'Hvis du legger til en ny ski, nullstilles alle sammenligningene.\n\n' +
            'Vil du fortsette?'
        )

      if (!confirmed) {
        return
      }
    }

    onAddSki(
      session.id,
      newSki
    )
  }

  // =========================
  // START REDIGERING
  // =========================

  function startEditingSki(ski) {
    setEditingSkiId(ski.id)

    setEditedSki({
      ...ski,
    })
  }

  // =========================
  // INPUT
  // =========================

  function handleSkiChange(event) {
    const {
      name,
      value,
    } = event.target

    setEditedSki(
      (currentSki) => ({
        ...currentSki,

        [name]: value,
      })
    )
  }

  // =========================
  // SJEKK OM OPPSETT ER ENDRET
  // =========================

  function hasSkiChanged(
    originalSki,
    updatedSki
  ) {
    if (!originalSki) {
      return false
    }

    return (
      Number(
        originalSki.skiNumber
      ) !==
        Number(
          updatedSki.skiNumber
        ) ||

      (originalSki.grind ?? '') !==
        (updatedSki.grind ?? '') ||

      (originalSki.rill ?? '') !==
        (updatedSki.rill ?? '') ||

      (originalSki.glideWax ?? '') !==
        (updatedSki.glideWax ?? '') ||

      (originalSki.topping ?? '') !==
        (updatedSki.topping ?? '')
    )
  }

  // =========================
  // LAGRE REDIGERING
  // =========================

  function saveEditedSki() {
    if (!editedSki) {
      return
    }

    const skiNumber =
      Number(
        editedSki.skiNumber
      )

    if (
      !skiNumber ||
      skiNumber < 1
    ) {
      alert(
        'Ski nummer må være minst 1.'
      )

      return
    }

    // -------------------------
    // DUPLIKAT
    // -------------------------

    const numberAlreadyExists =
      session.skis.some(
        (ski) =>
          ski.id !==
            editingSkiId &&

          Number(
            ski.skiNumber
          ) === skiNumber
      )

    if (numberAlreadyExists) {
      alert(
        `Ski ${skiNumber} finnes allerede.`
      )

      return
    }

    // -------------------------
    // NORMALISER DATA
    // -------------------------

    const updatedSki = {
      ...editedSki,

      skiNumber,

      grind:
        editedSki.grind?.trim() ??
        '',

      rill:
        editedSki.rill?.trim() ??
        '',

      glideWax:
        editedSki.glideWax?.trim() ??
        '',

      topping:
        editedSki.topping?.trim() ??
        '',
    }

    const originalSki =
      session.skis.find(
        (ski) =>
          ski.id ===
          editingSkiId
      )

    const skiChanged =
      hasSkiChanged(
        originalSki,
        updatedSki
      )

    // -------------------------
    // TESTING ER ALLEREDE STARTET
    // -------------------------

    if (
      skiChanged &&
      session.comparisons.length > 0
    ) {
      const confirmed =
        window.confirm(
          'Du har allerede startet testingen.\n\n' +
            'Hvis du endrer denne skien nå, vil alle registrerte sammenligninger bli nullstilt fordi de ble utført med det gamle skioppsettet.\n\n' +
            'Vil du fortsette?'
        )

      if (!confirmed) {
        return
      }
    }

    // -------------------------
    // INGEN ENDRING
    // -------------------------

    if (!skiChanged) {
      setEditingSkiId(null)
      setEditedSki(null)

      return
    }

    // -------------------------
    // LAGRE
    // -------------------------

    onUpdateSki(
      session.id,
      updatedSki
    )

    setEditingSkiId(null)
    setEditedSki(null)
  }

  // =========================
  // AVBRYT REDIGERING
  // =========================

  function cancelEditingSki() {
    setEditingSkiId(null)
    setEditedSki(null)
  }

  // =========================
  // SLETT SKI
  // =========================

  function handleDeleteSki(ski) {
    let message =
      `Er du sikker på at du vil slette Ski ${ski.skiNumber}?`

    if (
      session.comparisons.length > 0
    ) {
      message +=
        '\n\nAlle sammenligninger i testøkten blir også nullstilt.'
    }

    const confirmed =
      window.confirm(message)

    if (!confirmed) {
      return
    }

    onDeleteSki(
      session.id,
      ski.id
    )
  }

  // =========================
  // UI
  // =========================

  return (
    <>
      <h3>
        Ski i testøkten
      </h3>

      {session.skis.length === 0 && (
        <p>
          Ingen ski registrert ennå.
        </p>
      )}

      <div className="session-card-ski-grid">
        {[...session.skis]
          .sort(
            (a, b) =>
              Number(
                a.skiNumber
              ) -
              Number(
                b.skiNumber
              )
          )
          .map((ski) => (
            <div
              key={ski.id}
              className="session-card-ski"
            >
              {editingSkiId ===
              ski.id ? (
                <div>
                  <h4>
                    Rediger Ski{' '}
                    {ski.skiNumber}
                  </h4>

                  <div>
                    <label>
                      Ski nummer:
                    </label>

                    <input
                      type="number"
                      min="1"

                      name="skiNumber"

                      value={
                        editedSki
                          .skiNumber
                      }

                      onChange={
                        handleSkiChange
                      }
                    />
                  </div>

                  <div>
                    <label>
                      Slip / struktur:
                    </label>

                    <input
                      type="text"

                      name="grind"

                      value={
                        editedSki
                          .grind ?? ''
                      }

                      onChange={
                        handleSkiChange
                      }
                    />
                  </div>

                  <div>
                    <label>
                      Rill:
                    </label>

                    <input
                      type="text"

                      name="rill"

                      value={
                        editedSki
                          .rill ?? ''
                      }

                      onChange={
                        handleSkiChange
                      }
                    />
                  </div>

                  <div>
                    <label>
                      Glider:
                    </label>

                    <input
                      type="text"

                      name="glideWax"

                      value={
                        editedSki
                          .glideWax ?? ''
                      }

                      onChange={
                        handleSkiChange
                      }
                    />
                  </div>

                  <div>
                    <label>
                      Topping:
                    </label>

                    <input
                      type="text"

                      name="topping"

                      value={
                        editedSki
                          .topping ?? ''
                      }

                      onChange={
                        handleSkiChange
                      }
                    />
                  </div>

                  <div className="session-card-ski-actions">
                    <button
                      type="button"

                      onClick={
                        saveEditedSki
                      }
                    >
                      Lagre
                    </button>

                    <button
                      type="button"

                      onClick={
                        cancelEditingSki
                      }
                    >
                      Avbryt
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <h4>
                    Ski{' '}
                    {ski.skiNumber}
                  </h4>

                  <p>
                    <strong>
                      Slip:
                    </strong>{' '}
                    {ski.grind ||
                      'Ikke registrert'}
                  </p>

                  <p>
                    <strong>
                      Rill:
                    </strong>{' '}
                    {ski.rill ||
                      'Ikke registrert'}
                  </p>

                  <p>
                    <strong>
                      Glider:
                    </strong>{' '}
                    {ski.glideWax ||
                      'Ikke registrert'}
                  </p>

                  <p>
                    <strong>
                      Topping:
                    </strong>{' '}
                    {ski.topping ||
                      'Ikke registrert'}
                  </p>

                  <div className="session-card-ski-actions">
                    <button
                      type="button"

                      onClick={() =>
                        startEditingSki(
                          ski
                        )
                      }
                    >
                      Rediger
                    </button>

                    <button
                      type="button"

                      onClick={() =>
                        handleDeleteSki(
                          ski
                        )
                      }
                    >
                      Slett
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
      </div>

      <SkiForm
        existingSkis={
          session.skis
        }

        onAddSki={
          handleAddSki
        }
      />
    </>
  )
}

export default SkiSection