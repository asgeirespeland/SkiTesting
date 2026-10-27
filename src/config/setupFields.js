export const SETUP_FIELDS = [
  {
    name: 'grind',
    idField: 'grindId',
    label: 'Slip / struktur',
    placeholder:
      'Velg slip',
  },
  {
    name: 'rill',
    idField: 'rillId',
    label: 'Rill',
    placeholder:
      'Velg rill',
  },
  {
    name: 'glideWax',
    idField: 'glideWaxId',
    label: 'Glider',
    placeholder:
      'Velg glider',
  },
  {
    name: 'topping',
    idField: 'toppingId',
    label: 'Topping',
    placeholder:
      'Velg topping',
  },
]

export function getSetupSuggestions(
  skis,
  fieldName
) {
  return [
    ...new Set(
      skis
        .map(
          (ski) =>
            ski[fieldName]
        )
        .filter(
          (value) =>
            typeof value ===
              'string' &&
            value.trim() !== ''
        )
        .map(
          (value) =>
            value.trim()
        )
    ),
  ].sort(
    (a, b) =>
      a.localeCompare(
        b,
        'nb'
      )
  )
}