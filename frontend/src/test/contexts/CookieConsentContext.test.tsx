import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { ReactNode } from 'react'
import { CookieConsentProvider, useCookieConsent } from '../../contexts/CookieConsentContext'

describe('CookieConsentContext', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  const wrapper = ({ children }: { children: ReactNode }) => (
    <CookieConsentProvider>{children}</CookieConsentProvider>
  )

  describe('Initial State', () => {
    it('should initialize with default preferences', () => {
      const { result } = renderHook(() => useCookieConsent(), { wrapper })

      expect(result.current.preferences).toEqual({
        essential: true,
        analytics: false,
        marketing: false,
      })
      expect(result.current.hasConsented).toBe(false)
      expect(result.current.isSettingsOpen).toBe(false)
    })

    it('should load preferences from localStorage if available', async () => {
      const storedPreferences = {
        essential: true,
        analytics: true,
        marketing: false,
        timestamp: new Date().toISOString(),
      }
      localStorage.setItem('kanbanium-cookie-consent', JSON.stringify(storedPreferences))

      const { result } = renderHook(() => useCookieConsent(), { wrapper })

      await waitFor(() => {
        expect(result.current.hasConsented).toBe(true)
      })

      expect(result.current.preferences).toEqual({
        essential: true,
        analytics: true,
        marketing: false,
      })
    })

    it('should handle corrupted localStorage data gracefully', () => {
      localStorage.setItem('kanbanium-cookie-consent', 'invalid-json')
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const { result } = renderHook(() => useCookieConsent(), { wrapper })

      expect(result.current.preferences).toEqual({
        essential: true,
        analytics: false,
        marketing: false,
      })
      expect(result.current.hasConsented).toBe(false)
      expect(consoleSpy).toHaveBeenCalled()

      consoleSpy.mockRestore()
    })
  })

  describe('Accept All', () => {
    it('should accept all cookies', () => {
      const { result } = renderHook(() => useCookieConsent(), { wrapper })

      act(() => {
        result.current.acceptAll()
      })

      expect(result.current.preferences).toEqual({
        essential: true,
        analytics: true,
        marketing: true,
      })
      expect(result.current.hasConsented).toBe(true)
    })

    it('should save preferences to localStorage', () => {
      const { result } = renderHook(() => useCookieConsent(), { wrapper })

      act(() => {
        result.current.acceptAll()
      })

      const stored = localStorage.getItem('kanbanium-cookie-consent')
      expect(stored).toBeTruthy()
      const parsed = JSON.parse(stored!)
      expect(parsed.analytics).toBe(true)
      expect(parsed.marketing).toBe(true)
      expect(parsed.timestamp).toBeTruthy()
    })

    it('should close settings modal when accepting all', () => {
      const { result } = renderHook(() => useCookieConsent(), { wrapper })

      act(() => {
        result.current.openSettings()
      })
      expect(result.current.isSettingsOpen).toBe(true)

      act(() => {
        result.current.acceptAll()
      })
      expect(result.current.isSettingsOpen).toBe(false)
    })
  })

  describe('Reject Non-Essential', () => {
    it('should reject non-essential cookies', () => {
      const { result } = renderHook(() => useCookieConsent(), { wrapper })

      act(() => {
        result.current.rejectNonEssential()
      })

      expect(result.current.preferences).toMatchObject({
        essential: true,
        analytics: false,
        marketing: false,
      })
      expect(result.current.hasConsented).toBe(true)
    })

    it('should save rejection to localStorage', () => {
      const { result } = renderHook(() => useCookieConsent(), { wrapper })

      act(() => {
        result.current.rejectNonEssential()
      })

      const stored = localStorage.getItem('kanbanium-cookie-consent')
      expect(stored).toBeTruthy()
      const parsed = JSON.parse(stored!)
      expect(parsed.analytics).toBe(false)
      expect(parsed.marketing).toBe(false)
    })
  })

  describe('Accept Selected', () => {
    it('should accept only selected preferences', () => {
      const { result } = renderHook(() => useCookieConsent(), { wrapper })

      act(() => {
        result.current.acceptSelected({
          essential: true,
          analytics: true,
          marketing: false,
        })
      })

      expect(result.current.preferences).toMatchObject({
        essential: true,
        analytics: true,
        marketing: false,
      })
      expect(result.current.hasConsented).toBe(true)
    })

    it('should always keep essential as true even if false is passed', () => {
      const { result } = renderHook(() => useCookieConsent(), { wrapper })

      act(() => {
        result.current.acceptSelected({
          essential: false as any, // Try to set essential to false
          analytics: true,
          marketing: true,
        })
      })

      expect(result.current.preferences).toMatchObject({
        essential: true,
        analytics: true,
        marketing: true,
      })
    })

    it('should save selected preferences to localStorage', () => {
      const { result } = renderHook(() => useCookieConsent(), { wrapper })

      act(() => {
        result.current.acceptSelected({
          essential: true,
          analytics: false,
          marketing: true,
        })
      })

      const stored = localStorage.getItem('kanbanium-cookie-consent')
      expect(stored).toBeTruthy()
      const parsed = JSON.parse(stored!)
      expect(parsed.analytics).toBe(false)
      expect(parsed.marketing).toBe(true)
    })
  })

  describe('Settings Modal', () => {
    it('should open settings modal', () => {
      const { result } = renderHook(() => useCookieConsent(), { wrapper })

      act(() => {
        result.current.openSettings()
      })

      expect(result.current.isSettingsOpen).toBe(true)
    })

    it('should close settings modal', () => {
      const { result } = renderHook(() => useCookieConsent(), { wrapper })

      act(() => {
        result.current.openSettings()
      })
      expect(result.current.isSettingsOpen).toBe(true)

      act(() => {
        result.current.closeSettings()
      })
      expect(result.current.isSettingsOpen).toBe(false)
    })

    it('should close settings when accepting selected preferences', () => {
      const { result } = renderHook(() => useCookieConsent(), { wrapper })

      act(() => {
        result.current.openSettings()
      })
      expect(result.current.isSettingsOpen).toBe(true)

      act(() => {
        result.current.acceptSelected({
          essential: true,
          analytics: true,
          marketing: false,
        })
      })
      expect(result.current.isSettingsOpen).toBe(false)
    })
  })

  describe('Error Handling', () => {
    it('should throw error when used outside provider', () => {
      expect(() => {
        renderHook(() => useCookieConsent())
      }).toThrow('useCookieConsent must be used within a CookieConsentProvider')
    })
  })

  describe('Persistence', () => {
    it('should persist preferences across provider remounts', async () => {
      const { result: result1 } = renderHook(() => useCookieConsent(), { wrapper })

      act(() => {
        result1.current.acceptAll()
      })

      // Unmount and remount
      const { result: result2 } = renderHook(() => useCookieConsent(), { wrapper })

      await waitFor(() => {
        expect(result2.current.hasConsented).toBe(true)
      })

      expect(result2.current.preferences).toEqual({
        essential: true,
        analytics: true,
        marketing: true,
      })
    })
  })
})
