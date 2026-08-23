import {
  useState,
} from 'react'

import {
  SNOW_TYPES,
  SNOW_CONDITIONS,
  WEATHER_OPTIONS,
} from '../../config/conditionOptions'

import './SessionForm.css'

function toNumberOrNull(
  value
) {
  if (
    value === '' ||
    value === null ||
    value === undefined
  ) {
    return null
  }

  const number =
    Number(value)

  return Number.isNaN(
    number
  )
    ? null
    : number
}

function SessionForm({
  onAddSession,
}) {
  const [
    formData,
    setFormData,
  ] = useState({
    title: '',
    date: '',
    time: '',
    location: '',

    airTemperature: '',
    snowTemperature: '',
    humidity: '',

    snowType: '',
    snowCondition: '',
    weather: '',
  })

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

  function handleSubmit(
    event
  ) {
    event.preventDefault()

    const newSession = {
      id: Date.now(),

      title:
        formData.title.trim(),

      date:
        formData.date,

      time:
        formData.time,

      location:
        formData.location.trim(),

      status: 'active',

      completedAt: null,

      conditions: {
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

      skis: [],
      comparisons: [],
    }

    onAddSession(
      newSession
    )

    setFormData({
      title: '',
      date: '',
      time: '',
      location: '',

      airTemperature: '',
      snowTemperature: '',
      humidity: '',

      snowType: '',
      snowCondition: '',
      weather: '',
    })
  }

  return (
    <form
      className="session-form"
      onSubmit={
        handleSubmit
      }
    >
      <div className="session-form-field">
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
          placeholder="F.eks. Glidtest Sjusjøen"
          required
        />
      </div>

      <div className="session-form-field">
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
          placeholder="F.eks. Sjusjøen"
        />
      </div>

      <div className="session-form-field">
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
          required
        />
      </div>

      <div className="session-form-field">
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

      <div className="session-form-field">
        <label>
          Lufttemperatur
        </label>

        <input
          type="number"
          step="0.1"
          name="airTemperature"
          value={
            formData.airTemperature
          }
          onChange={
            handleChange
          }
          placeholder="-5"
        />
      </div>

      <div className="session-form-field">
        <label>
          Snøtemperatur
        </label>

        <input
          type="number"
          step="0.1"
          name="snowTemperature"
          value={
            formData.snowTemperature
          }
          onChange={
            handleChange
          }
          placeholder="-7"
        />
      </div>

      <div className="session-form-field">
        <label>
          Luftfuktighet (%)
        </label>

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
          placeholder="75"
        />
      </div>

      <div className="session-form-field">
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

      <div className="session-form-field">
        <label>
          Snøforhold
        </label>

        <select
          name="snowCondition"
          value={
            formData.snowCondition
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

      <div className="session-form-field">
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

      <button
        className="session-form-submit"
        type="submit"
      >
        Opprett testøkt
      </button>
    </form>
  )
}

export default SessionForm