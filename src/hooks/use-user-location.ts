import { useCallback, useState } from 'react'
import { isMockMode } from '../lib/mock-mode'
import type { Coordinates } from '../lib/nearby-stops'

type UserLocationStatus = 'idle' | 'prompting' | 'denied' | 'error' | 'ready'

interface UserLocationResult {
  coordinates: Coordinates | null
  errorMessage: string | null
  requestLocation: () => void
  status: UserLocationStatus
}

const MOCK_COORDINATES: Coordinates = {
  lat: 40.75529,
  lon: -73.987495,
}

const STORAGE_KEY = 'user-location'

function loadStoredCoordinates(): Coordinates | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (typeof parsed.lat === 'number' && typeof parsed.lon === 'number') {
      return parsed as Coordinates
    }
  } catch {
    // ignore parse errors
  }
  return null
}

function saveCoordinates(coords: Coordinates): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(coords))
  } catch {
    // ignore storage errors (e.g. private browsing quota)
  }
}

export function useUserLocation(): UserLocationResult {
  const stored = loadStoredCoordinates()
  const [status, setStatus] = useState<UserLocationStatus>(stored ? 'ready' : 'idle')
  const [coordinates, setCoordinates] = useState<Coordinates | null>(stored)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const requestLocation = useCallback(() => {
    if (isMockMode()) {
      setCoordinates(MOCK_COORDINATES)
      setErrorMessage(null)
      setStatus('ready')
      return
    }

    if (!navigator.geolocation) {
      setCoordinates(null)
      setErrorMessage('Geolocation is not supported in this browser.')
      setStatus('error')
      return
    }

    setStatus('prompting')
    setErrorMessage(null)

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const next = { lat: coords.latitude, lon: coords.longitude }
        saveCoordinates(next)
        setCoordinates(next)
        setStatus('ready')
      },
      (error) => {
        setCoordinates(null)

        if (error.code === error.PERMISSION_DENIED) {
          setErrorMessage('Location access was denied.')
          setStatus('denied')
          return
        }

        setErrorMessage('Unable to get your current location.')
        setStatus('error')
      },
      {
        enableHighAccuracy: false,
        timeout: 10_000,
        maximumAge: 60_000,
      },
    )
  }, [])

  return {
    coordinates,
    errorMessage,
    requestLocation,
    status,
  }
}
