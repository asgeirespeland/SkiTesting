export const SETUP_FIELDS = [
  {
    name: 'grind',
    label: 'Slip / struktur',
    placeholder: 'Skriv eller velg slip',
  },
  {
    name: 'rill',
    label: 'Rill',
    placeholder: 'Skriv eller velg rill',
  },
  {
    name: 'glideWax',
    label: 'Glider',
    placeholder: 'Skriv eller velg glider',
  },
  {
    name: 'topping',
    label: 'Topping',
    placeholder: 'Skriv eller velg topping',
  },
]

export function getSetupSuggestions(
  skis,
  fieldName
) {
  return [
    ...new Set(
      skis
        .map((ski) => ski[fieldName])
        .filter(
          (value) =>
            typeof value === 'string' &&
            value.trim() !== ''
        )
        .map((value) => value.trim())
    ),
  ].sort((a, b) =>
    a.localeCompare(b, 'nb')
  )
}