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

export function useUserLocation(): UserLocationResult {
  const [status, setStatus] = useState<UserLocationStatus>('idle')
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null)
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
        setCoordinates({
          lat: coords.latitude,
          lon: coords.longitude,
        })
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
