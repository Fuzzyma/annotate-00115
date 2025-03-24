import type { PetAgeData } from "./types"

export function calculateHumanAge(
  species: string,
  breed: string,
  petAge: number,
  data: Array<PetAgeData>,
): number | null {
  // Find the relevant entry
  const entry = data.find((item) => item.species === species && item.breed === breed)

  if (!entry) return null // No matching data

  const { firstPhaseYears, firstPhaseValue, laterPerYear } = entry

  // Calculate human-equivalent age
  if (petAge <= firstPhaseYears) {
    return petAge * firstPhaseValue
  } else {
    return firstPhaseYears * firstPhaseValue + (petAge - firstPhaseYears) * laterPerYear
  }
}

export function getUniqueSpecies(data: PetAgeData[]): string[] {
  return [...new Set(data.map((item) => item.species))]
}

export function getBreedsBySpecies(species: string, data: PetAgeData[]): string[] {
  return data.filter((item) => item.species === species).map((item) => item.breed)
}

