export const EQUIPMENT_TYPES = [
  {
    value: 'grind',
    label: 'Slip',
    namePlaceholder:
      'F.eks. S1',
    usesTemperatureRange: false,
  },
  {
    value: 'rill',
    label: 'Rill',
    namePlaceholder:
      'F.eks. 1 mm rett',
    usesTemperatureRange: false,
  },
  {
    value: 'glideWax',
    label: 'Glider',
    namePlaceholder:
      'F.eks. TS5',
    usesTemperatureRange: true,
  },
  {
    value: 'topping',
    label: 'Topping',
    namePlaceholder:
      'F.eks. TSP5',
    usesTemperatureRange: true,
  },
]

export function getEquipmentType(
  type
) {
  return (
    EQUIPMENT_TYPES.find(
      (item) =>
        item.value === type
    ) ?? null
  )
}

export function getEquipmentTypeLabel(
  type
) {
  return (
    getEquipmentType(type)
      ?.label ?? type
  )
}

export function usesTemperatureRange(
  type
) {
  return (
    getEquipmentType(type)
      ?.usesTemperatureRange ??
    false
  )
}