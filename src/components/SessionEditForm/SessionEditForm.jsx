import { useState } from 'react'

import {
  SNOW_TYPES,
  SNOW_CONDITIONS,
  WEATHER_OPTIONS,
} from '../../config/conditionOptions'

import './SessionEditForm.css'

function valueOrEmpty(value) {
  return value ?? ''
}

function toNumberOrNull(value) {
  if (
    value === '' ||
    value === null ||
    value === undefined
  ) {
    return null
  }

  const number = Number(value)

  return Number.isNaN(number)
    ? null
    : number
}

function SessionEditForm({
  session,
  onSave,
  onCancel,
}) {
  const [
    formData,
    setFormData,
  ] = useState({
    title:
      session.title ?? '',

    location:
      session.location ?? '',

    date:
      session.date ?? '',

    time:
      session.time ?? '',

    airTemperature:
      valueOrEmpty(
        session.conditions
          ?.airTemperature
      ),

    snowTemperature:
      valueOrEmpty(
        session.conditions
          ?.snowTemperature
      ),

    humidity:
      valueOrEmpty(
        session.conditions
          ?.humidity
      ),

    snowType:
      session.conditions
        ?.snowType ?? '',

    snowCondition:
      session.conditions
        ?.snowCondition ?? '',

    weather:
      session.conditions
        ?.weather ?? '',
  })

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

    if (
      !formData.title.trim()
    ) {
      alert(
        'Testøkten må ha et navn.'
      )

      return
    }

    const updatedSession = {
      ...session,

      title:
        formData.title.trim(),

      location:
        formData.location.trim(),

      date:
        formData.date,

      time:
        formData.time,

      conditions: {
        ...session.conditions,

        airTemperature:
          toNumberOrNull(
            formData.airTemperature
          ),

        snowTemperature:
          toNumberOrNull(
            formData.snowTemperature
          ),

        humidity:
          toNumberOrNull(
            formData.humidity
          ),

        snowType:
          formData.snowType,

        snowCondition:
          formData.snowCondition,

        weather:
          formData.weather,
      },
    }

    onSave(updatedSession)
  }

  return (
    <form
      className="session-edit-form"
      onSubmit={handleSubmit}
    >
      <div className="session-edit-form-header">
        <div>
          <h3>
            Rediger testøkt
          </h3>

          <p>
            Oppdater informasjon og
            forhold for testøkten.
          </p>
        </div>
      </div>

      <div className="session-edit-form-grid">
        {/* Navn */}

        <div className="session-edit-form-field">
          <label>
            Navn på testøkt
          </label>

          <input
            type="text"
            name="title"
            value={
              formData.title
            }
            onChange={
              handleChange
            }
            required
          />
        </div>

        {/* Sted */}

        <div className="session-edit-form-field">
          <label>
            Sted
          </label>

          <input
            type="text"
            name="location"
            value={
              formData.location
            }
            onChange={
              handleChange
            }
          />
        </div>

        {/* Dato */}

        <div className="session-edit-form-field">
          <label>
            Dato
          </label>

          <input
            type="date"
            name="date"
            value={
              formData.date
            }
            onChange={
              handleChange
            }
          />
        </div>

        {/* Tid */}

        <div className="session-edit-form-field">
          <label>
            Tidspunkt
          </label>

          <input
            type="time"
            name="time"
            value={
              formData.time
            }
            onChange={
              handleChange
            }
          />
        </div>

        {/* Lufttemperatur */}

        <div className="session-edit-form-field">
          <label>
            Lufttemperatur
          </label>

          <div className="session-edit-number-input">
            <input
              type="number"
              step="0.1"
              name="airTemperature"
              value={
                formData
                  .airTemperature
              }
              onChange={
                handleChange
              }
            />

            <span>
              °C
            </span>
          </div>
        </div>

        {/* Snøtemperatur */}

        <div className="session-edit-form-field">
          <label>
            Snøtemperatur
          </label>

          <div className="session-edit-number-input">
            <input
              type="number"
              step="0.1"
              name="snowTemperature"
              value={
                formData
                  .snowTemperature
              }
              onChange={
                handleChange
              }
            />

            <span>
              °C
            </span>
          </div>
        </div>

        {/* Luftfuktighet */}

        <div className="session-edit-form-field">
          <label>
            Luftfuktighet
          </label>

          <div className="session-edit-number-input">
            <input
              type="number"
              min="0"
              max="100"
              name="humidity"
              value={
                formData.humidity
              }
              onChange={
                handleChange
              }
            />

            <span>
              %
            </span>
          </div>
        </div>

        {/* Snøtype */}

        <div className="session-edit-form-field">
          <label>
            Snøtype
          </label>

          <select
            name="snowType"
            value={
              formData.snowType
            }
            onChange={
              handleChange
            }
          >
            <option value="">
              Ikke registrert
            </option>

            {SNOW_TYPES.map(
              (option) => (
                <option
                  key={option}
                  value={option}
                >
                  {option}
                </option>
              )
            )}
          </select>
        </div>

        {/* Snøforhold */}

        <div className="session-edit-form-field">
          <label>
            Snøforhold
          </label>

          <select
            name="snowCondition"
            value={
              formData
                .snowCondition
            }
            onChange={
              handleChange
            }
          >
            <option value="">
              Ikke registrert
            </option>

            {SNOW_CONDITIONS.map(
              (option) => (
                <option
                  key={option}
                  value={option}
                >
                  {option}
                </option>
              )
            )}
          </select>
        </div>

        {/* Vær */}

        <div className="session-edit-form-field">
          <label>
            Vær
          </label>

          <select
            name="weather"
            value={
              formData.weather
            }
            onChange={
              handleChange
            }
          >
            <option value="">
              Ikke registrert
            </option>

            {WEATHER_OPTIONS.map(
              (option) => (
                <option
                  key={option}
                  value={option}
                >
                  {option}
                </option>
              )
            )}
          </select>
        </div>
      </div>

      {/* Knapper */}

      <div className="session-edit-form-actions">
        <button
          type="submit"
          className="session-edit-save"
        >
          Lagre endringer
        </button>

        <button
          type="button"
          className="session-edit-cancel"
          onClick={onCancel}
        >
          Avbryt
        </button>
      </div>
    </form>
  )
}

export default SessionEditForm