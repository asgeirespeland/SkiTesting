import { useEffect, useState } from 'react'

import {
  calculateComparisonResult,
  FEELING_CM_PER_POINT,
} from '../../utils/comparisonScoring'

import './ComparisonForm.css'

function ComparisonForm({
  skis,
  onAddComparison,
  suggestedPair,
}) {
  const [formData, setFormData] = useState({
    skiAId: '',
    skiBId: '',
    glideLeaderId: '',
    glideDifferenceCm: '',
    feelingA: 3,
    feelingB: 3,
    manualWinnerId: '',
  })

  useEffect(() => {
    if (suggestedPair) {
      setFormData({
        skiAId: suggestedPair.skiAId,
        skiBId: suggestedPair.skiBId,
        glideLeaderId: '',
        glideDifferenceCm: '',
        feelingA: 3,
        feelingB: 3,
        manualWinnerId: '',
      })
    }
  }, [suggestedPair])

  function handleChange(event) {
    const { name, value } = event.target

    if (
      name === 'glideLeaderId' &&
      value === 'equal'
    ) {
      setFormData((currentData) => ({
        ...currentData,
        glideLeaderId: 'equal',
        glideDifferenceCm: '0',
      }))

      return
    }

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }))
  }

  if (!suggestedPair) {
    return null
  }

  const skiA = skis.find(
    (ski) =>
      ski.id === Number(formData.skiAId)
  )

  const skiB = skis.find(
    (ski) =>
      ski.id === Number(formData.skiBId)
  )

  const normalizedGlideLeaderId =
    formData.glideLeaderId === 'equal'
      ? null
      : Number(formData.glideLeaderId)

  const result = calculateComparisonResult({
    skiAId: formData.skiAId,
    skiBId: formData.skiBId,

    glideLeaderId:
      normalizedGlideLeaderId,

    glideDifferenceCm:
      formData.glideDifferenceCm,

    feelingA: formData.feelingA,
    feelingB: formData.feelingB,
  })

  const automaticWinner = skis.find(
    (ski) =>
      ski.id === result.automaticWinnerId
  )

  const manualWinnerId =
    formData.manualWinnerId
      ? Number(formData.manualWinnerId)
      : null

  const effectiveWinnerId =
    manualWinnerId ??
    result.automaticWinnerId

  const effectiveWinner = skis.find(
    (ski) =>
      ski.id === effectiveWinnerId
  )

  const winnerOverridden =
    manualWinnerId !== null &&
    manualWinnerId !==
      result.automaticWinnerId

  function handleSubmit(event) {
    event.preventDefault()

    if (!formData.glideLeaderId) {
      alert(
        'Registrer hvem som gled lengst.'
      )
      return
    }

    if (
      formData.glideLeaderId !== 'equal' &&
      Number(formData.glideDifferenceCm) <= 0
    ) {
      alert(
        'Registrer glidforskjellen i cm.'
      )
      return
    }

    if (!effectiveWinnerId) {
      alert(
        'Resultatet er for jevnt. ' +
          'Test skiene på nytt eller overstyr resultatet.'
      )
      return
    }

    const newComparison = {
      id: Date.now(),

      skiAId: Number(formData.skiAId),
      skiBId: Number(formData.skiBId),

      glideLeaderId:
        normalizedGlideLeaderId,

      glideDifferenceCm: Number(
        formData.glideDifferenceCm
      ),

      feelingA: Number(
        formData.feelingA
      ),

      feelingB: Number(
        formData.feelingB
      ),

      glideScore: result.glideScore,
      feelingScore: result.feelingScore,
      calculatedScore: result.totalScore,

      automaticWinnerId:
        result.automaticWinnerId,

      winnerId: effectiveWinnerId,

      winnerOverridden,

      round:
        suggestedPair?.round ?? 1,
    }

    onAddComparison(newComparison)
  }

  return (
    <form
      className="comparison-form"
      onSubmit={handleSubmit}
    >
      <h3>{suggestedPair.label}</h3>

      <div className="comparison-skis">
        <div className="comparison-ski">
          <h4>
            Ski {skiA?.skiNumber}
          </h4>

          <p>
            <strong>Slip:</strong>{' '}
            {skiA?.grind}
          </p>

          <p>
            <strong>Rill:</strong>{' '}
            {skiA?.rill}
          </p>

          <p>
            <strong>Glider:</strong>{' '}
            {skiA?.glideWax}
          </p>

          <p>
            <strong>Topping:</strong>{' '}
            {skiA?.topping}
          </p>
        </div>

        <div className="comparison-vs">
          VS
        </div>

        <div className="comparison-ski">
          <h4>
            Ski {skiB?.skiNumber}
          </h4>

          <p>
            <strong>Slip:</strong>{' '}
            {skiB?.grind}
          </p>

          <p>
            <strong>Rill:</strong>{' '}
            {skiB?.rill}
          </p>

          <p>
            <strong>Glider:</strong>{' '}
            {skiB?.glideWax}
          </p>

          <p>
            <strong>Topping:</strong>{' '}
            {skiB?.topping}
          </p>
        </div>
      </div>

      <div className="comparison-section">
        <h4>Glid</h4>

        <div className="comparison-field">
          <label>
            Hvem gled lengst?
          </label>

          <select
            name="glideLeaderId"
            value={
              formData.glideLeaderId
            }
            onChange={handleChange}
            required
          >
            <option value="">
              Velg resultat
            </option>

            <option value={skiA?.id}>
              Ski {skiA?.skiNumber}
            </option>

            <option value="equal">
              Lik glid
            </option>

            <option value={skiB?.id}>
              Ski {skiB?.skiNumber}
            </option>
          </select>
        </div>

        <div className="comparison-field">
          <label>
            Forskjell i glid (cm)
          </label>

          <input
            type="number"
            min="0"
            name="glideDifferenceCm"
            value={
              formData.glideDifferenceCm
            }
            onChange={handleChange}
            disabled={
              formData.glideLeaderId ===
              'equal'
            }
            placeholder="F.eks. 20"
          />
        </div>
      </div>

      <div className="comparison-section">
        <h4>Følelse</h4>

        <div className="comparison-field">
          <label>
            Ski {skiA?.skiNumber}
          </label>

          <select
            name="feelingA"
            value={formData.feelingA}
            onChange={handleChange}
          >
            <option value={1}>1 / 5</option>
            <option value={2}>2 / 5</option>
            <option value={3}>3 / 5</option>
            <option value={4}>4 / 5</option>
            <option value={5}>5 / 5</option>
          </select>
        </div>

        <div className="comparison-field">
          <label>
            Ski {skiB?.skiNumber}
          </label>

          <select
            name="feelingB"
            value={formData.feelingB}
            onChange={handleChange}
          >
            <option value={1}>1 / 5</option>
            <option value={2}>2 / 5</option>
            <option value={3}>3 / 5</option>
            <option value={4}>4 / 5</option>
            <option value={5}>5 / 5</option>
          </select>
        </div>
      </div>

      {formData.glideLeaderId && (
        <div className="comparison-result">
          <h4>Automatisk vurdering</h4>

          <p>
            Glidscore:{' '}
            <strong>
              {result.glideScore > 0
                ? '+'
                : ''}
              {result.glideScore} cm
            </strong>
          </p>

          <p>
            Følelsesjustering:{' '}
            <strong>
              {result.feelingScore > 0
                ? '+'
                : ''}
              {result.feelingScore} cm
            </strong>
          </p>

          <p>
            <small>
              1 poeng i følelse tilsvarer
              foreløpig{' '}
              {FEELING_CM_PER_POINT} cm.
            </small>
          </p>

          <p>
            Samlet score:{' '}
            <strong>
              {result.totalScore > 0
                ? '+'
                : ''}
              {result.totalScore}
            </strong>
          </p>

          {automaticWinner ? (
            <p className="comparison-result-winner">
              🏆 Anbefalt vinner:{' '}
              <strong>
                Ski{' '}
                {
                  automaticWinner.skiNumber
                }
              </strong>
            </p>
          ) : (
            <p className="comparison-result-winner">
              ⚖️ Resultatet er for jevnt
            </p>
          )}

          <div className="comparison-field">
            <label>
              Overstyr resultat
            </label>

            <select
              name="manualWinnerId"
              value={
                formData.manualWinnerId
              }
              onChange={handleChange}
            >
              <option value="">
                Bruk automatisk vurdering
              </option>

              <option value={skiA?.id}>
                Ski {skiA?.skiNumber}
              </option>

              <option value={skiB?.id}>
                Ski {skiB?.skiNumber}
              </option>
            </select>
          </div>

          {winnerOverridden && (
            <p>
              ⚠️ Automatisk resultat
              overstyres manuelt.
            </p>
          )}

          {effectiveWinner && (
            <p>
              <strong>
                Ski som går videre:
              </strong>{' '}
              Ski{' '}
              {
                effectiveWinner.skiNumber
              }
            </p>
          )}
        </div>
      )}

      <button
        className="comparison-submit"
        type="submit"
      >
        Lagre resultat
      </button>
    </form>
  )
}

export default ComparisonForm