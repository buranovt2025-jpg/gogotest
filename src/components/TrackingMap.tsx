/**
 * Карта Yandex Maps с маркером позиции курьера.
 * Требует VITE_YANDEX_MAPS_KEY в .env. Без ключа показывается заглушка.
 */

import { useEffect, useRef, useState } from 'react'

const YANDEX_SCRIPT_URL = 'https://api-maps.yandex.ru/2.1/?apikey='
const DEFAULT_CENTER: [number, number] = [41.2995, 69.2401] // Tashkent
const DEFAULT_ZOOM = 14

declare global {
  interface Window {
    ymaps?: {
      ready: (cb: () => void) => void
      Map: new (element: string | HTMLElement, state: { center: number[]; zoom: number }) => {
        geoObjects: { add: (obj: unknown) => void; remove: (obj: unknown) => void }
        setCenter: (center: number[]) => void
      }
      Placemark: new (center: number[], properties?: unknown, options?: unknown) => unknown
      Polyline: new (coordinates: number[][], properties?: unknown, options?: unknown) => unknown
    }
  }
}

export interface TrackPoint {
  lat: number
  lng: number
  at: string
}

interface TrackingMapProps {
  lat: number | null
  lng: number | null
  /** Последняя сохранённая позиция из API (пока нет обновления по WS) */
  initialLat?: number | null
  initialLng?: number | null
  /** История трека для отрисовки маршрута */
  tracks?: TrackPoint[]
  height?: number
  className?: string
}

export default function TrackingMap({ lat, lng, initialLat, initialLng, tracks, height = 280 }: TrackingMapProps) {
  const displayLat = lat ?? initialLat ?? null
  const displayLng = lng ?? initialLng ?? null
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<ReturnType<Window['ymaps']['Map']> | null>(null)
  const placemarkRef = useRef<unknown>(null)
  const polylineRef = useRef<unknown>(null)
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const apiKey = (import.meta.env.VITE_YANDEX_MAPS_KEY as string)?.trim()

  useEffect(() => {
    if (!apiKey) {
      setError('VITE_YANDEX_MAPS_KEY not set')
      return
    }
    if (window.ymaps) {
      setScriptLoaded(true)
      return
    }
    const script = document.createElement('script')
    script.src = `${YANDEX_SCRIPT_URL}${apiKey}&lang=ru_RU`
    script.async = true
    script.onload = () => setScriptLoaded(true)
    script.onerror = () => setError('Failed to load Yandex Maps')
    document.head.appendChild(script)
    return () => {
      script.remove()
    }
  }, [apiKey])

  useEffect(() => {
    if (!scriptLoaded || !window.ymaps || !containerRef.current) return

    window.ymaps.ready(() => {
      const center: [number, number] = displayLat != null && displayLng != null ? [displayLat, displayLng] : DEFAULT_CENTER
      const map = new window.ymaps!.Map(containerRef.current!, {
        center,
        zoom: DEFAULT_ZOOM,
      })
      mapRef.current = map

      if (displayLat != null && displayLng != null) {
        const placemark = new window.ymaps!.Placemark([displayLat, displayLng])
        map.geoObjects.add(placemark)
        placemarkRef.current = placemark
      }
    })

    return () => {
      mapRef.current = null
      placemarkRef.current = null
    }
  }, [scriptLoaded])

  useEffect(() => {
    if (!window.ymaps || !mapRef.current) return
    if (displayLat != null && displayLng != null) {
      const map = mapRef.current
      map.setCenter([displayLat, displayLng])
      if (placemarkRef.current) {
        (placemarkRef.current as { geometry?: { setCoordinates: (c: number[]) => void } }).geometry?.setCoordinates([displayLat, displayLng])
      } else {
        const placemark = new window.ymaps!.Placemark([displayLat, displayLng])
        map.geoObjects.add(placemark)
        placemarkRef.current = placemark
      }
    }
  }, [displayLat, displayLng])

  useEffect(() => {
    if (!window.ymaps || !mapRef.current || !tracks || tracks.length < 2) {
      if (polylineRef.current && mapRef.current) {
        mapRef.current.geoObjects.remove(polylineRef.current as never)
        polylineRef.current = null
      }
      return
    }
    const coords = tracks.map((t) => [t.lat, t.lng] as [number, number])
    const polyline = new window.ymaps!.Polyline(coords)
    if (polylineRef.current) mapRef.current.geoObjects.remove(polylineRef.current as never)
    mapRef.current.geoObjects.add(polyline)
    polylineRef.current = polyline
    return () => {
      if (polylineRef.current && mapRef.current) {
        mapRef.current.geoObjects.remove(polylineRef.current as never)
        polylineRef.current = null
      }
    }
  }, [tracks])

  if (error) {
    return (
      <div style={{ height, background: '#e2e8f0', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '0.9rem' }}>
        {error}
      </div>
    )
  }

  if (!apiKey) {
    return (
      <div style={{ height, background: '#f1f5f9', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '0.9rem' }}>
        Set VITE_YANDEX_MAPS_KEY for map
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height, borderRadius: 8, overflow: 'hidden' }}
      aria-label="Map"
    />
  )
}
