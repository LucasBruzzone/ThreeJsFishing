import { ZONE_COUNT } from '../config/zones'

export interface ZoneTransition {
  currentZone: number
  nextZone: number
  blend: number
}

export const getZoneTransition = (progress: number): ZoneTransition => {
  const scaled = progress * (ZONE_COUNT - 1)
  const currentZone = Math.min(Math.floor(scaled), ZONE_COUNT - 2)
  const nextZone = Math.min(currentZone + 1, ZONE_COUNT - 1)
  const blend = scaled - currentZone

  return { currentZone, nextZone, blend }
}
