import {
  useEffect,
  useState,
} from 'react'

import SetupInput from '../SetupInput/SetupInput'

import {
  SETUP_FIELDS,
  getSetupSuggestions,
} from '../../config/setupFields'

import './SkiForm.css'

function getNextSkiNumber(existingSkis) {
  const usedNumbers = new Set(
    existingSkis.map(
      (ski) => Number(ski.skiNumber)
    )
  )

  let number = 1

  while (usedNumbers.has(number)) {
    number += 1
  }

  return number
}

function SkiForm({
  onAddSki,
  existingSkis = [],
}) {
  const [formData, setFormData] =
    useState(() => ({
      skiNumber:
        getNextSkiNumber(
          existingSkis
        ),

      grind: '',
      rill: '',
      glideWax: '',
      topping: '',
    }))

  // =========================
  // NESTE LEDIGE SKINUMMER
  // =========================

  useEffect(() => {
    setFormData((currentData) => ({
      ...currentData,

      skiNumber:
        getNextSkiNumber(
          existingSkis
        ),
    }))
  }, [existingSkis])

  // =========================
  // INPUT
  // =========================

  function handleChange(event) {
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
  // LAGRE
  // =========================

  function handleSubmit(event) {
    event.preventDefault()

    const skiNumber =
      Number(formData.skiNumber)

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
          Number(ski.skiNumber) ===
          skiNumber
      )

    if (numberAlreadyExists) {
      alert(
        `Ski ${skiNumber} finnes allerede.`
      )

      return
    }

    const newSki = {
      id: Date.now(),

      skiNumber,

      grind:
        formData.grind.trim(),

      rill:
        formData.rill.trim(),

      glideWax:
        formData.glideWax.trim(),

      topping:
        formData.topping.trim(),
    }

    onAddSki(newSki)

    setFormData(
      (currentData) => ({
        ...currentData,

        grind: '',
        rill: '',
        glideWax: '',
        topping: '',
      })
    )
  }

  return (
    <form
      className="ski-form"
      onSubmit={handleSubmit}
    >
      <h3>Legg til ski</h3>

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
          (field) => (
            <SetupInput
              key={field.name}

              name={field.name}
              label={field.label}

              value={
                formData[
                  field.name
                ]
              }

              placeholder={
                field.placeholder
              }

              suggestions={
                getSetupSuggestions(
                  existingSkis,
                  field.name
                )
              }

              onChange={
                handleChange
              }
            />
          )
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