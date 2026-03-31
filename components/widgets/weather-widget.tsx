'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { Search, Wind, Droplets, Thermometer, RefreshCw, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const STORAGE_KEY = 'symbiosis-weather-city'

interface GeoResult {
  name: string
  latitude: number
  longitude: number
  country: string
  admin1?: string
}

interface WeatherData {
  temperature: number
  feelsLike: number
  humidity: number
  windSpeed: number
  weatherCode: number
  isDay: number
}

function wmoDescription(code: number): { label: string; emoji: string } {
  if (code === 0)                         return { label: 'Clear Sky',          emoji: '☀️' }
  if (code <= 2)                          return { label: 'Partly Cloudy',      emoji: '⛅' }
  if (code === 3)                         return { label: 'Overcast',           emoji: '☁️' }
  if (code <= 49)                         return { label: 'Foggy',              emoji: '🌫️' }
  if (code <= 57)                         return { label: 'Drizzle',            emoji: '🌦️' }
  if (code <= 67)                         return { label: 'Rain',               emoji: '🌧️' }
  if (code <= 77)                         return { label: 'Snow',               emoji: '❄️' }
  if (code <= 82)                         return { label: 'Rain Showers',       emoji: '🌧️' }
  if (code <= 86)                         return { label: 'Snow Showers',       emoji: '🌨️' }
  if (code <= 99)                         return { label: 'Thunderstorm',       emoji: '⛈️' }
  return { label: 'Unknown', emoji: '🌡️' }
}

export function WeatherWidget() {
  const [city, setCity] = useState('')
  const [search, setSearch] = useState('')
  const [geo, setGeo] = useState<GeoResult | null>(null)
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const refreshRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Load saved city from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) { setCity(saved); setSearch(saved) }
    } catch { /* ignore */ }
  }, [])

  const fetchWeather = useCallback(async (location: GeoResult) => {
    setLoading(true)
    setError(null)
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,is_day&wind_speed_unit=mph&temperature_unit=fahrenheit`
      const res = await fetch(url)
      if (!res.ok) throw new Error('Weather fetch failed')
      const data = await res.json()
      const c = data.current
      setWeather({
        temperature: Math.round(c.temperature_2m),
        feelsLike: Math.round(c.apparent_temperature),
        humidity: c.relative_humidity_2m,
        windSpeed: Math.round(c.wind_speed_10m),
        weatherCode: c.weather_code,
        isDay: c.is_day,
      })
      setLastUpdated(new Date())
    } catch {
      setError('Failed to fetch weather data')
    } finally {
      setLoading(false)
    }
  }, [])

  // Auto-refresh every 10 minutes
  useEffect(() => {
    if (!geo) return
    fetchWeather(geo)
    if (refreshRef.current) clearInterval(refreshRef.current)
    refreshRef.current = setInterval(() => fetchWeather(geo), 10 * 60 * 1000)
    return () => { if (refreshRef.current) clearInterval(refreshRef.current) }
  }, [geo, fetchWeather])

  async function geocodeCity(name: string) {
    if (!name.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1&language=en&format=json`)
      if (!res.ok) throw new Error('Geocoding failed')
      const data = await res.json()
      if (!data.results?.length) { setError(`City "${name}" not found`); setLoading(false); return }
      const result: GeoResult = data.results[0]
      setGeo(result)
      setCity(name)
      try { localStorage.setItem(STORAGE_KEY, name) } catch { /* ignore */ }
    } catch {
      setError('Could not find city')
      setLoading(false)
    }
  }

  const { label, emoji } = weather ? wmoDescription(weather.weatherCode) : { label: '', emoji: '' }

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      {/* Search bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
          <input
            className="w-full pl-7 pr-3 py-1.5 text-xs font-mono bg-background/60 border border-border rounded-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20 transition-colors"
            placeholder="Enter city name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') geocodeCity(search) }}
          />
        </div>
        <Button
          size="sm"
          variant="outline"
          className="h-7 px-2.5 text-xs font-mono border-border hover:border-primary/60 rounded-sm"
          onClick={() => geocodeCity(search)}
          disabled={loading}
        >
          <Search className="w-3 h-3" />
        </Button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center flex-1 gap-2 text-xs font-mono text-muted-foreground">
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          Fetching weather...
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="text-[11px] font-mono text-destructive border border-destructive/30 rounded-sm px-3 py-2 bg-destructive/5">
          {'>'} {error}
        </div>
      )}

      {/* Weather display */}
      {weather && geo && !loading && (
        <div className="flex flex-col gap-3 flex-1">
          {/* City + condition */}
          <div className="text-center space-y-1">
            <div className="text-xs text-muted-foreground font-mono">
              {geo.name}{geo.admin1 ? `, ${geo.admin1}` : ''}, {geo.country}
            </div>
            <div className="text-5xl">{emoji}</div>
            <div className="text-xs text-primary font-mono uppercase tracking-widest">{label}</div>
          </div>

          {/* Temperature */}
          <div className="text-center">
            <div className="text-4xl font-mono font-bold text-foreground tabular-nums">
              {weather.temperature}°F
            </div>
            <div className="text-[10px] text-muted-foreground font-mono mt-1">
              Feels like {weather.feelsLike}°F
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-2 mt-auto">
            <div className="border border-border rounded-sm p-2.5 flex items-center gap-2">
              <Droplets className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <div>
                <div className="text-[9px] text-muted-foreground uppercase tracking-wider">Humidity</div>
                <div className="text-sm font-mono tabular-nums text-foreground">{weather.humidity}%</div>
              </div>
            </div>
            <div className="border border-border rounded-sm p-2.5 flex items-center gap-2">
              <Wind className="w-3.5 h-3.5 text-primary shrink-0" />
              <div>
                <div className="text-[9px] text-muted-foreground uppercase tracking-wider">Wind</div>
                <div className="text-sm font-mono tabular-nums text-foreground">{weather.windSpeed} mph</div>
              </div>
            </div>
            <div className="border border-border rounded-sm p-2.5 flex items-center gap-2 col-span-2">
              <Thermometer className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <div className="flex-1 flex items-center justify-between">
                <div>
                  <div className="text-[9px] text-muted-foreground uppercase tracking-wider">Condition</div>
                  <div className="text-xs font-mono text-foreground">{label}</div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] text-muted-foreground uppercase tracking-wider">Period</div>
                  <div className="text-xs font-mono text-foreground">{weather.isDay ? 'Daytime' : 'Nighttime'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Last updated */}
          {lastUpdated && (
            <div className="flex items-center justify-between text-[10px] text-muted-foreground/60 font-mono">
              <span>Updated {lastUpdated.toLocaleTimeString()}</span>
              <button
                onClick={() => fetchWeather(geo)}
                className="hover:text-primary transition-colors flex items-center gap-1"
              >
                <RefreshCw className="w-2.5 h-2.5" />
                Refresh
              </button>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!weather && !loading && !error && (
        <div className="flex flex-col items-center justify-center flex-1 gap-2 text-center">
          <div className="text-3xl">🌍</div>
          <div className="text-xs text-muted-foreground font-mono">Enter a city name above</div>
          <div className="text-[10px] text-muted-foreground/60 font-mono">to get current weather conditions</div>
        </div>
      )}
    </div>
  )
}
