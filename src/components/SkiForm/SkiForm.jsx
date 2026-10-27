import {
  useEffect,
  useState,
} from 'react'

import {
  SETUP_FIELDS,
} from '../../config/setupFields'

import './SkiForm.css'

// =========================
// NESTE LEDIGE SKINUMMER
// =========================

function getNextSkiNumber(
  existingSkis
) {
  const usedNumbers =
    new Set(
      existingSkis.map(
        (ski) =>
          Number(
            ski.skiNumber
          )
      )
    )

  let number = 1

  while (
    usedNumbers.has(number)
  ) {
    number += 1
  }

  return number
}

// =========================
// VISNINGSNAVN PÅ UTSTYR
// =========================

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

// =========================
// SKIFORM
// =========================

function SkiForm({
  onAddSki,
  existingSkis = [],
  equipment = [],
}) {
  const [
    formData,
    setFormData,
  ] = useState(() => ({
    skiNumber:
      getNextSkiNumber(
        existingSkis
      ),

    grindId: '',
    rillId: '',
    glideWaxId: '',
    toppingId: '',
  }))

  // =========================
  // NESTE SKINUMMER
  // =========================

  useEffect(() => {
    setFormData(
      (currentData) => ({
        ...currentData,

        skiNumber:
          getNextSkiNumber(
            existingSkis
          ),
      })
    )
  }, [existingSkis])

  // =========================
  // INPUT
  // =========================

  function handleChange(
    event
  ) {
    const {
      name,
      value,
    } = event.target

    setFormData(
      (currentData) => ({
        ...currentData,
        [name]: value,
      })
    )
  }

  // =========================
  // UTSTYR FOR EN TYPE
  // =========================

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

  // =========================
  // FINN VALGT UTSTYR
  // =========================

  function getSelectedEquipment(
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

  // =========================
  // LAGRE SKI
  // =========================

  function handleSubmit(
    event
  ) {
    event.preventDefault()

    const skiNumber =
      Number(
        formData.skiNumber
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

    const numberAlreadyExists =
      existingSkis.some(
        (ski) =>
          Number(
            ski.skiNumber
          ) === skiNumber
      )

    if (
      numberAlreadyExists
    ) {
      alert(
        `Ski ${skiNumber} finnes allerede.`
      )

      return
    }

    const newSki = {
      id: Date.now(),

      skiNumber,
    }

    SETUP_FIELDS.forEach(
      (field) => {
        const equipmentId =
          formData[
            field.idField
          ]

        const selectedItem =
          getSelectedEquipment(
            equipmentId
          )

        newSki[
          field.idField
        ] =
          selectedItem?.id ??
          null

        newSki[field.name] =
          selectedItem
            ? getEquipmentName(
                selectedItem
              )
            : ''
      }
    )

    onAddSki(
      newSki
    )

    setFormData(
      (currentData) => ({
        ...currentData,

        grindId: '',
        rillId: '',
        glideWaxId: '',
        toppingId: '',
      })
    )
  }

  return (
    <form
      className="ski-form"
      onSubmit={
        handleSubmit
      }
    >
      <h3>
        Legg til ski
      </h3>

      <div className="ski-form-grid">
        <div>
          <label>
            Ski nummer:
          </label>

          <input
            type="number"
            min="1"
            name="skiNumber"
            value={
              formData.skiNumber
            }
            onChange={
              handleChange
            }
            required
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
                  {field.label}:
                </label>

                <select
                  name={
                    field.idField
                  }
                  value={
                    formData[
                      field.idField
                    ]
                  }
                  onChange={
                    handleChange
                  }
                >
                  <option value="">
                    Ikke valgt
                  </option>

                  {options.map(
                    (item) => (
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

                {options.length ===
                  0 && (
                  <small className="ski-form-no-equipment">
                    Ingen{' '}
                    {field.label.toLowerCase()}{' '}
                    registrert under
                    Utstyr.
                  </small>
                )}
              </div>
            )
          }
        )}
      </div>

      <button type="submit">
        + Legg til Ski{' '}
        {formData.skiNumber}
      </button>
    </form>
  )
}

export default SkiForm