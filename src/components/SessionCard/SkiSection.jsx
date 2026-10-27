import {
  useState,
} from 'react'

import SkiForm from '../SkiForm/SkiForm'

import {
  SETUP_FIELDS,
} from '../../config/setupFields'

function getEquipmentName(
  item
) {
  const name =
    item.name?.trim() ?? ''

  const brand =
    item.brand?.trim() ?? ''

  if (brand) {
    return `${brand} ${name}`
  }

  return name
}

function SkiSection({
  session,
  equipment = [],

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

  function getEquipmentForType(
    type
  ) {
    return equipment
      .filter(
        (item) =>
          item.type === type
      )
      .sort(
        (a, b) =>
          getEquipmentName(a)
            .localeCompare(
              getEquipmentName(b),
              'nb'
            )
      )
  }

  function findEquipmentById(
    id
  ) {
    if (!id) {
      return null
    }

    return (
      equipment.find(
        (item) =>
          String(item.id) ===
          String(id)
      ) ?? null
    )
  }

  function findEquipmentByName(
    type,
    name
  ) {
    if (!name) {
      return null
    }

    return (
      equipment.find(
        (item) =>
          item.type ===
            type &&
          getEquipmentName(
            item
          ) === name
      ) ?? null
    )
  }

  // =========================
  // LEGG TIL SKI
  // =========================

  function handleAddSki(
    newSki
  ) {
    if (
      session.comparisons
        ?.length > 0
    ) {
      const confirmed =
        window.confirm(
          'Du har allerede startet testingen. Hvis du legger til en ny ski, slettes alle registrerte dueller og turneringen starter på nytt. Vil du fortsette?'
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

  function startEditingSki(
    ski
  ) {
    const editableSki = {
      ...ski,
    }

    /*
     * Gamle ski kan mangle
     * equipment-ID.
     *
     * Hvis navnet matcher et
     * katalogprodukt, finner vi
     * ID-en automatisk.
     */
    SETUP_FIELDS.forEach(
      (field) => {
        if (
          editableSki[
            field.idField
          ]
        ) {
          return
        }

        const matchingItem =
          findEquipmentByName(
            field.name,
            editableSki[
              field.name
            ]
          )

        if (matchingItem) {
          editableSki[
            field.idField
          ] =
            matchingItem.id
        }
      }
    )

    setEditingSkiId(
      ski.id
    )

    setEditedSki(
      editableSki
    )
  }

  function cancelEditingSki() {
    setEditingSkiId(null)
    setEditedSki(null)
  }

  // =========================
  // INPUT
  // =========================

  function handleEditChange(
    event
  ) {
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
  // HAR SKIEN ENDRET SEG?
  // =========================

  function hasSkiChanged(
    originalSki,
    updatedSki
  ) {
    if (
      Number(
        originalSki.skiNumber
      ) !==
      Number(
        updatedSki.skiNumber
      )
    ) {
      return true
    }

    return SETUP_FIELDS.some(
      (field) =>
        String(
          originalSki[
            field.idField
          ] ?? ''
        ) !==
          String(
            updatedSki[
              field.idField
            ] ?? ''
          ) ||
        (
          originalSki[
            field.name
          ] ?? ''
        ) !==
          (
            updatedSki[
              field.name
            ] ?? ''
          )
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

    const duplicateNumber =
      session.skis.some(
        (ski) =>
          ski.id !==
            editedSki.id &&
          Number(
            ski.skiNumber
          ) === skiNumber
      )

    if (
      duplicateNumber
    ) {
      alert(
        `Ski ${skiNumber} finnes allerede.`
      )

      return
    }

    const updatedSki = {
      ...editedSki,
      skiNumber,
    }

    /*
     * Oppdater både ID og
     * historisk visningsnavn.
     */
    SETUP_FIELDS.forEach(
      (field) => {
        const selectedItem =
          findEquipmentById(
            editedSki[
              field.idField
            ]
          )

        updatedSki[
          field.idField
        ] =
          selectedItem?.id ??
          null

        updatedSki[
          field.name
        ] =
          selectedItem
            ? getEquipmentName(
                selectedItem
              )
            : ''
      }
    )

    const originalSki =
      session.skis.find(
        (ski) =>
          ski.id ===
          editedSki.id
      )

    if (!originalSki) {
      return
    }

    const changed =
      hasSkiChanged(
        originalSki,
        updatedSki
      )

    if (!changed) {
      cancelEditingSki()
      return
    }

    if (
      session.comparisons
        ?.length > 0
    ) {
      const confirmed =
        window.confirm(
          'Denne skien er allerede brukt i testingen. Hvis du endrer skioppsettet, slettes alle registrerte dueller og turneringen starter på nytt. Vil du fortsette?'
        )

      if (!confirmed) {
        return
      }
    }

    onUpdateSki(
      session.id,
      updatedSki
    )

    cancelEditingSki()
  }

  // =========================
  // SLETT
  // =========================

  function handleDeleteSki(
    ski
  ) {
    let message =
      `Vil du slette Ski ${ski.skiNumber}?`

    if (
      session.comparisons
        ?.length > 0
    ) {
      message +=
        '\n\nAlle registrerte dueller vil også bli slettet fordi turneringen må bygges på nytt.'
    }

    const confirmed =
      window.confirm(
        message
      )

    if (!confirmed) {
      return
    }

    onDeleteSki(
      session.id,
      ski.id
    )

    if (
      editingSkiId ===
      ski.id
    ) {
      cancelEditingSki()
    }
  }

  return (
    <section className="ski-section">
      <div className="ski-section-header">
        <div>
          <h3>
            Ski i testen
          </h3>

          <p>
            {session.skis.length}{' '}
            ski registrert
          </p>
        </div>
      </div>

      {session.skis.length ===
      0 ? (
        <p className="ski-empty-message">
          Ingen ski er lagt til
          ennå.
        </p>
      ) : (
        <div className="ski-list">
          {session.skis.map(
            (ski) => {
              const isEditing =
                editingSkiId ===
                ski.id

              return (
                <article
                  key={ski.id}
                  className="ski-item"
                >
                  {isEditing ? (
                    <>
                      <div className="ski-edit-grid">
                        <div>
                          <label>
                            Ski nummer
                          </label>

                          <input
                            type="number"
                            min="1"
                            name="skiNumber"
                            value={
                              editedSki
                                ?.skiNumber ??
                              ''
                            }
                            onChange={
                              handleEditChange
                            }
                          />
                        </div>

                        {SETUP_FIELDS.map(
                          (field) => {
                            const options =
                              getEquipmentForType(
                                field.name
                              )

                            return (
                              <div
                                key={
                                  field.name
                                }
                              >
                                <label>
                                  {
                                    field.label
                                  }
                                </label>

                                <select
                                  name={
                                    field.idField
                                  }
                                  value={
                                    editedSki?.[
                                      field
                                        .idField
                                    ] ?? ''
                                  }
                                  onChange={
                                    handleEditChange
                                  }
                                >
                                  <option value="">
                                    Ikke valgt
                                  </option>

                                  {options.map(
                                    (
                                      item
                                    ) => (
                                      <option
                                        key={
                                          item.id
                                        }
                                        value={
                                          item.id
                                        }
                                      >
                                        {getEquipmentName(
                                          item
                                        )}
                                      </option>
                                    )
                                  )}
                                </select>
                              </div>
                            )
                          }
                        )}
                      </div>

                      <div className="ski-edit-actions">
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
                    </>
                  ) : (
                    <>
                      <div className="ski-item-header">
                        <h4>
                          Ski{' '}
                          {
                            ski.skiNumber
                          }
                        </h4>

                        <div className="ski-item-actions">
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

                      <div className="ski-details">
                        <p>
                          <strong>
                            Slip:
                          </strong>{' '}
                          {ski.grind ||
                            'Ikke valgt'}
                        </p>

                        <p>
                          <strong>
                            Rill:
                          </strong>{' '}
                          {ski.rill ||
                            'Ikke valgt'}
                        </p>

                        <p>
                          <strong>
                            Glider:
                          </strong>{' '}
                          {ski.glideWax ||
                            'Ikke valgt'}
                        </p>

                        <p>
                          <strong>
                            Topping:
                          </strong>{' '}
                          {ski.topping ||
                            'Ikke valgt'}
                        </p>
                      </div>
                    </>
                  )}
                </article>
              )
            }
          )}
        </div>
      )}

      <SkiForm
        existingSkis={
          session.skis
        }
        equipment={
          equipment
        }
        onAddSki={
          handleAddSki
        }
      />
    </section>
  )
}

export default SkiSection