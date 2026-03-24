'use client'

import { useEffect, useState } from 'react'

import {
  COUNTRY_LIST,
  dispatchCountryChanged,
  getStoredCountry,
  isCountryManuallySet,
  markCountryAsManual,
  setStoredCountry,
} from '@/lib/currency'

const DEFAULT_COUNTRY = 'FR'

export function CountrySelector() {
  const [selected, setSelected] = useState<string>(DEFAULT_COUNTRY)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    async function detect() {
      // If the user already made an explicit choice, restore it and stop
      if (isCountryManuallySet()) {
        const stored = getStoredCountry()
        if (stored) setSelected(stored)
        setReady(true)
        return
      }

      // Otherwise detect from the browser's real IP every time (catches VPN changes)
      try {
        // Try ipapi.co first
        const res = await fetch('https://ipapi.co/json/', {
          signal: AbortSignal.timeout(4000),
        })
        if (res.ok) {
          const data = await res.json()
          const detected: string = data.country_code ?? ''
          const valid = COUNTRY_LIST.some((c) => c.countryCode === detected)
          if (valid) {
            setSelected(detected)
            setStoredCountry(detected)
            setReady(true)
            return
          }
        }
      } catch { /* fall through */ }

      // Fallback: api.country.is
      try {
        const res = await fetch('https://api.country.is/', {
          signal: AbortSignal.timeout(4000),
        })
        if (res.ok) {
          const data = await res.json()
          const detected: string = data.country ?? ''
          const valid = COUNTRY_LIST.some((c) => c.countryCode === detected)
          if (valid) {
            setSelected(detected)
            setStoredCountry(detected)
            setReady(true)
            return
          }
        }
      } catch { /* fall through */ }

      // Final default
      setSelected(DEFAULT_COUNTRY)
      setStoredCountry(DEFAULT_COUNTRY)
      setReady(true)
    }

    void detect()
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const countryCode = e.target.value
    setSelected(countryCode)
    setStoredCountry(countryCode)
    markCountryAsManual()
    dispatchCountryChanged(countryCode)
  }

  const selectedCountry =
    COUNTRY_LIST.find((country) => country.countryCode === selected) ??
    COUNTRY_LIST.find((country) => country.countryCode === DEFAULT_COUNTRY) ??
    COUNTRY_LIST[0]

  return (
    <div className={`relative mx-auto inline-flex w-fit items-center justify-center transition-opacity duration-150 ${ready ? 'opacity-100' : 'opacity-0'}`}>
      <div className="pointer-events-none inline-flex items-center justify-center gap-1">
        <span className="font-futura text-center font-medium text-[13px] tracking-[0.1em] uppercase text-black whitespace-nowrap">
          {selectedCountry.countryName} — {selectedCountry.currencyCode} {selectedCountry.currencySymbol}
        </span>
        <svg
          className="w-2.5 h-2.5 text-black shrink-0"
          viewBox="0 0 10 6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <title>Expand</title>
          <path d="M1 1l4 4 4-4" />
        </svg>
      </div>
      <select
        value={selected}
        onChange={handleChange}
        className="absolute inset-0 w-full h-full cursor-pointer opacity-0 appearance-none"
        aria-label="Select country / currency"
      >
        {COUNTRY_LIST.map((c) => (
          <option key={c.countryCode} value={c.countryCode}>
            {c.countryName} — {c.currencyCode} {c.currencySymbol}
          </option>
        ))}
      </select>
    </div>
  )
}
