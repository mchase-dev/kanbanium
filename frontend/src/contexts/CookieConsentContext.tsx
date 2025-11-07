import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type CookieCategory = 'essential' | 'analytics' | 'marketing'

export interface CookiePreferences {
  essential: boolean // Always true, cannot be disabled
  analytics: boolean
  marketing: boolean
}

interface CookieConsentContextType {
  preferences: CookiePreferences
  hasConsented: boolean
  acceptAll: () => void
  acceptSelected: (prefs: CookiePreferences) => void
  rejectNonEssential: () => void
  openSettings: () => void
  closeSettings: () => void
  isSettingsOpen: boolean
}

const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined)

const STORAGE_KEY = 'kanbanium-cookie-consent'

const defaultPreferences: CookiePreferences = {
  essential: true,
  analytics: false,
  marketing: false,
}

interface CookieConsentProviderProps {
  children: ReactNode
}

export function CookieConsentProvider({ children }: CookieConsentProviderProps) {
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences)
  const [hasConsented, setHasConsented] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  // Load preferences from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setPreferences({
          essential: true, // Always true
          analytics: parsed.analytics ?? false,
          marketing: parsed.marketing ?? false,
        })
        setHasConsented(true)
      } catch (error) {
        console.error('Failed to parse cookie preferences:', error)
      }
    }
  }, [])

  const savePreferences = (prefs: CookiePreferences) => {
    const prefsToSave = {
      ...prefs,
      essential: true, // Ensure essential is always true
      timestamp: new Date().toISOString(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefsToSave))
    setPreferences(prefsToSave)
    setHasConsented(true)
    setIsSettingsOpen(false)
  }

  const acceptAll = () => {
    savePreferences({
      essential: true,
      analytics: true,
      marketing: true,
    })
  }

  const acceptSelected = (prefs: CookiePreferences) => {
    savePreferences(prefs)
  }

  const rejectNonEssential = () => {
    savePreferences({
      essential: true,
      analytics: false,
      marketing: false,
    })
  }

  const openSettings = () => {
    setIsSettingsOpen(true)
  }

  const closeSettings = () => {
    setIsSettingsOpen(false)
  }

  return (
    <CookieConsentContext.Provider
      value={{
        preferences,
        hasConsented,
        acceptAll,
        acceptSelected,
        rejectNonEssential,
        openSettings,
        closeSettings,
        isSettingsOpen,
      }}
    >
      {children}
    </CookieConsentContext.Provider>
  )
}

export function useCookieConsent() {
  const context = useContext(CookieConsentContext)
  if (context === undefined) {
    throw new Error('useCookieConsent must be used within a CookieConsentProvider')
  }
  return context
}
