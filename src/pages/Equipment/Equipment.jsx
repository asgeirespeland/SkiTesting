import {
  useState,
} from 'react'

import {
  EQUIPMENT_TYPES,
  getEquipmentType,
  getEquipmentTypeLabel,
  usesTemperatureRange,
} from '../../config/equipmentTypes'

import {
  SNOW_TYPES,
  SNOW_CONDITIONS,
} from '../../config/conditionOptions'


import '../../styles/PageLayout.css'
import './Equipment.css'

// =========================
// TOMT SKJEMA
// =========================

function getEmptyForm() {
  return {
    type: 'grind',

    name: '',
    brand: '',

    minTemperature: '',
    maxTemperature: '',

    snowTypes: [],
    snowConditions: [],

    notes: '',
  }
}

// =========================
// HAR FØREPROFIL?
// =========================

function usesSnowProfile(
  type
) {
  return (
    type === 'grind' ||
    type === 'rill'
  )
}

// =========================
// EQUIPMENT
// =========================

function Equipment({
  equipment,
  onAddEquipment,
  onUpdateEquipment,
  onDeleteEquipment,
}) {
  const [
    formData,
    setFormData,
  ] = useState(
    getEmptyForm
  )

  const [
    editingId,
    setEditingId,
  ] = useState(null)

  const isEditing =
    editingId !== null

  const selectedType =
    getEquipmentType(
      formData.type
    )

  const showTemperatureRange =
    usesTemperatureRange(
      formData.type
    )

  const showSnowProfile =
    usesSnowProfile(
      formData.type
    )

  // =========================
  // VANLIG INPUT
  // =========================

  function handleChange(
    event
  ) {
    const {
      name,
      value,
    } = event.target

    // =====================
    // TYPE ENDRES
    // =====================

    if (name === 'type') {
      const newTypeUsesTemperature =
        usesTemperatureRange(
          value
        )

      const newTypeUsesSnowProfile =
        usesSnowProfile(
          value
        )

      setFormData(
        (currentData) => ({
          ...currentData,

          type: value,

          /*
           * Behold temperatur bare
           * dersom den nye typen
           * bruker temperatur.
           */
          minTemperature:
            newTypeUsesTemperature
              ? currentData
                  .minTemperature
              : '',

          maxTemperature:
            newTypeUsesTemperature
              ? currentData
                  .maxTemperature
              : '',

          /*
           * Behold føreprofil bare
           * for slip/rill.
           */
          snowTypes:
            newTypeUsesSnowProfile
              ? currentData
                  .snowTypes
              : [],

          snowConditions:
            newTypeUsesSnowProfile
              ? currentData
                  .snowConditions
              : [],
        })
      )

      return
    }

    setFormData(
      (currentData) => ({
        ...currentData,

        [name]: value,
      })
    )
  }

  // =========================
  // CHECKBOX
  // =========================

  function handleCheckboxChange(
    field,
    value
  ) {
    setFormData(
      (currentData) => {
        const currentValues =
          currentData[field] ??
          []

        const alreadySelected =
          currentValues.includes(
            value
          )

        return {
          ...currentData,

          [field]:
            alreadySelected
              ? currentValues.filter(
                  (
                    currentValue
                  ) =>
                    currentValue !==
                    value
                )
              : [
                  ...currentValues,
                  value,
                ],
        }
      }
    )
  }

  // =========================
  // NULLSTILL
  // =========================

  function resetForm() {
    setFormData(
      getEmptyForm()
    )

    setEditingId(null)
  }

  // =========================
  // VALIDER TEMPERATUR
  // =========================

  function validateTemperatureRange() {
    if (
      !showTemperatureRange
    ) {
      return true
    }

    const hasMin =
      formData.minTemperature !==
      ''

    const hasMax =
      formData.maxTemperature !==
      ''

    /*
     * Enten begge temperaturene,
     * eller ingen.
     */
    if (
      hasMin !== hasMax
    ) {
      alert(
        'Fyll inn både minimums- og maksimumstemperatur, eller la begge stå tomme.'
      )

      return false
    }

    if (
      !hasMin &&
      !hasMax
    ) {
      return true
    }

    const minTemperature =
      Number(
        formData.minTemperature
      )

    const maxTemperature =
      Number(
        formData.maxTemperature
      )

    if (
      minTemperature >
      maxTemperature
    ) {
      alert(
        'Minimumstemperaturen kan ikke være høyere enn maksimumstemperaturen.'
      )

      return false
    }

    return true
  }

  // =========================
  // LAGRE
  // =========================

  function handleSubmit(
    event
  ) {
    event.preventDefault()

    const name =
      formData.name.trim()

    if (!name) {
      alert(
        'Utstyret må ha et navn.'
      )

      return
    }

    if (
      !validateTemperatureRange()
    ) {
      return
    }

    const item = {
      id:
        editingId ??
        Date.now(),

      type:
        formData.type,

      name,

      brand:
        formData.brand.trim(),

      // =====================
      // TEMPERATUR
      // =====================

      minTemperature:
        showTemperatureRange &&
        formData.minTemperature !==
          ''
          ? Number(
              formData.minTemperature
            )
          : null,

      maxTemperature:
        showTemperatureRange &&
        formData.maxTemperature !==
          ''
          ? Number(
              formData.maxTemperature
            )
          : null,

      // =====================
      // FØREPROFIL
      // =====================

      snowTypes:
        showSnowProfile
          ? [
              ...formData
                .snowTypes,
            ]
          : [],

      snowConditions:
        showSnowProfile
          ? [
              ...formData
                .snowConditions,
            ]
          : [],

      notes:
        formData.notes.trim(),
    }

    if (isEditing) {
      onUpdateEquipment(
        item
      )
    } else {
      onAddEquipment(
        item
      )
    }

    resetForm()
  }

  // =========================
  // REDIGER
  // =========================

  function startEditing(
    item
  ) {
    setEditingId(
      item.id
    )

    setFormData({
      type:
        item.type,

      name:
        item.name ?? '',

      brand:
        item.brand ?? '',

      minTemperature:
        item.minTemperature ??
        '',

      maxTemperature:
        item.maxTemperature ??
        '',

      snowTypes:
        item.snowTypes ??
        [],

      snowConditions:
        item.snowConditions ??
        [],

      notes:
        item.notes ?? '',
    })

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  // =========================
  // SLETT
  // =========================

  function handleDelete(
    item
  ) {
    const confirmed =
      window.confirm(
        `Vil du slette "${item.name}"?`
      )

    if (!confirmed) {
      return
    }

    onDeleteEquipment(
      item.id
    )

    if (
      editingId ===
      item.id
    ) {
      resetForm()
    }
  }

  // =========================
  // SORTERING
  // =========================

  const sortedEquipment = [
    ...equipment,
  ].sort(
    (a, b) =>
      a.name.localeCompare(
        b.name,
        'nb'
      )
  )

  // =========================
  // VISNING
  // =========================

  return (
    <main className="home">
      <header className="home-header">
        <div>
          <h1>
            Utstyr
          </h1>

          <p>
            Administrer slip,
            rill, glider og
            topping.
          </p>
        </div>
      </header>

      {/* =====================
          SKJEMA
      ===================== */}

      <section className="panel">
        <div className="equipment-form-header">
          <div>
            <h2>
              {isEditing
                ? 'Rediger utstyr'
                : 'Legg til utstyr'}
            </h2>

            <p>
              Bygg opp katalogen
              som brukes når du
              registrerer ski.
            </p>
          </div>

          {isEditing && (
            <button
              type="button"
              className="equipment-cancel-button"
              onClick={
                resetForm
              }
            >
              Avbryt
            </button>
          )}
        </div>

        <form
          className="equipment-form"
          onSubmit={
            handleSubmit
          }
        >
          {/* =====================
              TYPE
          ===================== */}

          <div className="equipment-field">
            <label>
              Type
            </label>

            <select
              name="type"
              value={
                formData.type
              }
              onChange={
                handleChange
              }
            >
              {EQUIPMENT_TYPES.map(
                (type) => (
                  <option
                    key={
                      type.value
                    }
                    value={
                      type.value
                    }
                  >
                    {
                      type.label
                    }
                  </option>
                )
              )}
            </select>
          </div>

          {/* =====================
              NAVN
          ===================== */}

          <div className="equipment-field">
            <label>
              Navn
            </label>

            <input
              type="text"
              name="name"
              value={
                formData.name
              }
              onChange={
                handleChange
              }
              placeholder={
                selectedType
                  ?.namePlaceholder ??
                'Navn'
              }
              required
            />
          </div>

          {/* =====================
              PRODUSENT
          ===================== */}

          <div className="equipment-field">
            <label>
              Produsent
            </label>

            <input
              type="text"
              name="brand"
              value={
                formData.brand
              }
              onChange={
                handleChange
              }
              placeholder="Valgfritt"
            />
          </div>

          {/* =====================
              TEMPERATUR
          ===================== */}

          {showTemperatureRange && (
            <>
              <div className="equipment-field">
                <label>
                  Minimumstemperatur
                </label>

                <div className="equipment-temperature-input">
                  <input
                    type="number"
                    step="0.1"
                    name="minTemperature"
                    value={
                      formData
                        .minTemperature
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="-10"
                  />

                  <span>
                    °C
                  </span>
                </div>
              </div>

              <div className="equipment-field">
                <label>
                  Maksimumstemperatur
                </label>

                <div className="equipment-temperature-input">
                  <input
                    type="number"
                    step="0.1"
                    name="maxTemperature"
                    value={
                      formData
                        .maxTemperature
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="-4"
                  />

                  <span>
                    °C
                  </span>
                </div>

                <small className="equipment-field-hint">
                  Produktets
                  anbefalte
                  temperaturintervall.
                </small>
              </div>
            </>
          )}

          {/* =====================
              SNØTYPE FOR SLIP/RILL
          ===================== */}

          {showSnowProfile && (
            <div className="equipment-field equipment-profile-field">
              <label>
                Passer snøtype
              </label>

              <div className="equipment-checkbox-group">
                {SNOW_TYPES.map(
                  (snowType) => (
                    <label
                      key={
                        snowType
                      }
                      className="equipment-checkbox-option"
                    >
                      <input
                        type="checkbox"
                        checked={
                          formData.snowTypes.includes(
                            snowType
                          )
                        }
                        onChange={() =>
                          handleCheckboxChange(
                            'snowTypes',
                            snowType
                          )
                        }
                      />

                      <span>
                        {
                          snowType
                        }
                      </span>
                    </label>
                  )
                )}
              </div>

              <small className="equipment-field-hint">
                Du kan velge
                flere typer.
              </small>
            </div>
          )}

          {/* =====================
              SNØFORHOLD FOR SLIP/RILL
          ===================== */}

          {showSnowProfile && (
            <div className="equipment-field equipment-profile-field">
              <label>
                Passer snøforhold
              </label>

              <div className="equipment-checkbox-group">
                {SNOW_CONDITIONS.map(
                  (
                    snowCondition
                  ) => (
                    <label
                      key={
                        snowCondition
                      }
                      className="equipment-checkbox-option"
                    >
                      <input
                        type="checkbox"
                        checked={
                          formData.snowConditions.includes(
                            snowCondition
                          )
                        }
                        onChange={() =>
                          handleCheckboxChange(
                            'snowConditions',
                            snowCondition
                          )
                        }
                      />

                      <span>
                        {
                          snowCondition
                        }
                      </span>
                    </label>
                  )
                )}
              </div>

              <small className="equipment-field-hint">
                Velg forholdene
                slipen eller
                rillen er aktuell
                for.
              </small>
            </div>
          )}

          {/* =====================
              NOTATER
          ===================== */}

          <div className="equipment-field equipment-notes-field">
            <label>
              Notater
            </label>

            <textarea
              name="notes"
              value={
                formData.notes
              }
              onChange={
                handleChange
              }
              placeholder={
                formData.type ===
                'grind'
                  ? 'F.eks. spesielle forhold der slipen fungerer godt'
                  : formData.type ===
                    'rill'
                  ? 'F.eks. rett, brutt eller hvordan rillen brukes'
                  : 'Valgfritt'
              }
              rows="3"
            />
          </div>

          <button
            className="equipment-save-button"
            type="submit"
          >
            {isEditing
              ? 'Lagre endringer'
              : `+ Legg til ${getEquipmentTypeLabel(
                  formData.type
                ).toLowerCase()}`}
          </button>
        </form>
      </section>

      {/* =====================
          KATALOG
      ===================== */}

      <section className="equipment-catalog">
        <div className="equipment-catalog-heading">
          <h2>
            Utstyrskatalog
          </h2>

          <span>
            {equipment.length}{' '}
            {equipment.length ===
            1
              ? 'element'
              : 'elementer'}
          </span>
        </div>

        {equipment.length ===
        0 ? (
          <div className="panel equipment-empty">
            <h3>
              Ingen utstyr
              registrert
            </h3>

            <p>
              Legg til første
              slip, rill, glider
              eller topping over.
            </p>
          </div>
        ) : (
          <div className="equipment-groups">
            {EQUIPMENT_TYPES.map(
              (type) => {
                const items =
                  sortedEquipment.filter(
                    (item) =>
                      item.type ===
                      type.value
                  )

                return (
                  <section
                    key={
                      type.value
                    }
                    className="equipment-group"
                  >
                    <div className="equipment-group-heading">
                      <h3>
                        {
                          type.label
                        }
                      </h3>

                      <span>
                        {
                          items.length
                        }
                      </span>
                    </div>

                    {items.length ===
                    0 ? (
                      <p className="equipment-group-empty">
                        Ingen
                        registrert
                      </p>
                    ) : (
                      <div className="equipment-grid">
                        {items.map(
                          (item) => {
                            const hasTemperature =
                              usesTemperatureRange(
                                item.type
                              ) &&
                              (
                                item.minTemperature !==
                                  null ||
                                item.maxTemperature !==
                                  null
                              )

                            const hasSnowTypes =
                              (
                                item.snowTypes ??
                                []
                              ).length >
                              0

                            const hasSnowConditions =
                              (
                                item.snowConditions ??
                                []
                              ).length >
                              0

                            return (
                              <article
                                key={
                                  item.id
                                }
                                className="equipment-card"
                              >
                                <div className="equipment-card-top">
                                  <div>
                                    <span className="equipment-type-label">
                                      {getEquipmentTypeLabel(
                                        item.type
                                      )}
                                    </span>

                                    <h4>
                                      {
                                        item.name
                                      }
                                    </h4>

                                    {item.brand && (
                                      <p>
                                        {
                                          item.brand
                                        }
                                      </p>
                                    )}
                                  </div>
                                </div>

                                {/* TEMPERATUR */}

                                {hasTemperature && (
                                  <div className="equipment-temperature">
                                    🌡️{' '}
                                    {item.minTemperature ??
                                      '–'}
                                    {' til '}
                                    {item.maxTemperature ??
                                      '–'}
                                    {' °C'}
                                  </div>
                                )}

                                {/* SNØTYPE */}

                                {hasSnowTypes && (
                                  <div className="equipment-profile">
                                    <strong>
                                      Snøtype
                                    </strong>

                                    <div className="equipment-tags">
                                      {item.snowTypes.map(
                                        (
                                          snowType
                                        ) => (
                                          <span
                                            key={
                                              snowType
                                            }
                                            className="equipment-tag"
                                          >
                                            {
                                              snowType
                                            }
                                          </span>
                                        )
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* SNØFORHOLD */}

                                {hasSnowConditions && (
                                  <div className="equipment-profile">
                                    <strong>
                                      Snøforhold
                                    </strong>

                                    <div className="equipment-tags">
                                      {item.snowConditions.map(
                                        (
                                          condition
                                        ) => (
                                          <span
                                            key={
                                              condition
                                            }
                                            className="equipment-tag"
                                          >
                                            {
                                              condition
                                            }
                                          </span>
                                        )
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* NOTATER */}

                                {item.notes && (
                                  <p className="equipment-notes">
                                    {
                                      item.notes
                                    }
                                  </p>
                                )}

                                <div className="equipment-card-actions">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      startEditing(
                                        item
                                      )
                                    }
                                  >
                                    Rediger
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleDelete(
                                        item
                                      )
                                    }
                                  >
                                    Slett
                                  </button>
                                </div>
                              </article>
                            )
                          }
                        )}
                      </div>
                    )}
                  </section>
                )
              }
            )}
          </div>
        )}
      </section>
    </main>
  )
}

export default Equipment