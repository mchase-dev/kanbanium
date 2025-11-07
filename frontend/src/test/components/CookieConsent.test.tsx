import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { CookieConsent } from '../../components/common/CookieConsent'
import { CookieConsentProvider } from '../../contexts/CookieConsentContext'

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <CookieConsentProvider>{component}</CookieConsentProvider>
    </BrowserRouter>
  )
}

describe('CookieConsent Component', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('Banner Display', () => {
    it('should display banner when user has not consented', async () => {
      renderWithProviders(<CookieConsent />)

      await waitFor(
        () => {
          expect(screen.getByRole('dialog', { name: /cookie consent banner/i })).toBeInTheDocument()
        },
        { timeout: 1500 }
      )
    })

    it('should not display banner when user has already consented', () => {
      localStorage.setItem(
        'kanbanium-cookie-consent',
        JSON.stringify({
          essential: true,
          analytics: true,
          marketing: false,
          timestamp: new Date().toISOString(),
        })
      )

      renderWithProviders(<CookieConsent />)

      expect(screen.queryByRole('dialog', { name: /cookie consent banner/i })).not.toBeInTheDocument()
    })

    it('should display banner title and description', async () => {
      renderWithProviders(<CookieConsent />)

      await waitFor(
        () => {
          expect(screen.getByText('We Value Your Privacy')).toBeInTheDocument()
        },
        { timeout: 1500 }
      )

      expect(screen.getByText(/We use cookies to enhance your browsing/i)).toBeInTheDocument()
    })

    it('should display links to Cookie Policy and Privacy Policy', async () => {
      renderWithProviders(<CookieConsent />)

      await waitFor(
        () => {
          expect(screen.getByRole('link', { name: /cookie policy/i })).toBeInTheDocument()
        },
        { timeout: 1500 }
      )

      expect(screen.getByRole('link', { name: /privacy policy/i })).toBeInTheDocument()
    })
  })

  describe('Banner Actions', () => {
    it('should hide banner when Accept All is clicked', async () => {
      const user = userEvent.setup()
      renderWithProviders(<CookieConsent />)

      await waitFor(
        () => {
          expect(screen.getByRole('button', { name: /accept all/i })).toBeInTheDocument()
        },
        { timeout: 1500 }
      )

      const acceptButton = screen.getByRole('button', { name: /accept all/i })
      await user.click(acceptButton)

      await waitFor(() => {
        expect(
          screen.queryByRole('dialog', { name: /cookie consent banner/i })
        ).not.toBeInTheDocument()
      })
    })

    it('should save preferences to localStorage when Accept All is clicked', async () => {
      const user = userEvent.setup()
      renderWithProviders(<CookieConsent />)

      await waitFor(
        () => {
          expect(screen.getByRole('button', { name: /accept all/i })).toBeInTheDocument()
        },
        { timeout: 1500 }
      )

      const acceptButton = screen.getByRole('button', { name: /accept all/i })
      await user.click(acceptButton)

      const stored = localStorage.getItem('kanbanium-cookie-consent')
      expect(stored).toBeTruthy()
      const parsed = JSON.parse(stored!)
      expect(parsed.analytics).toBe(true)
      expect(parsed.marketing).toBe(true)
    })

    it('should hide banner when Reject Non-Essential is clicked', async () => {
      const user = userEvent.setup()
      renderWithProviders(<CookieConsent />)

      await waitFor(
        () => {
          expect(screen.getByRole('button', { name: /reject non-essential/i })).toBeInTheDocument()
        },
        { timeout: 1500 }
      )

      const rejectButton = screen.getByRole('button', { name: /reject non-essential/i })
      await user.click(rejectButton)

      await waitFor(() => {
        expect(
          screen.queryByRole('dialog', { name: /cookie consent banner/i })
        ).not.toBeInTheDocument()
      })
    })

    it('should save rejection to localStorage when Reject Non-Essential is clicked', async () => {
      const user = userEvent.setup()
      renderWithProviders(<CookieConsent />)

      await waitFor(
        () => {
          expect(screen.getByRole('button', { name: /reject non-essential/i })).toBeInTheDocument()
        },
        { timeout: 1500 }
      )

      const rejectButton = screen.getByRole('button', { name: /reject non-essential/i })
      await user.click(rejectButton)

      const stored = localStorage.getItem('kanbanium-cookie-consent')
      expect(stored).toBeTruthy()
      const parsed = JSON.parse(stored!)
      expect(parsed.analytics).toBe(false)
      expect(parsed.marketing).toBe(false)
    })

    it('should open settings modal when Customize is clicked', async () => {
      const user = userEvent.setup()
      renderWithProviders(<CookieConsent />)

      await waitFor(
        () => {
          expect(screen.getByRole('button', { name: /customize/i })).toBeInTheDocument()
        },
        { timeout: 1500 }
      )

      const customizeButton = screen.getByRole('button', { name: /customize/i })
      await user.click(customizeButton)

      await waitFor(() => {
        expect(screen.getByRole('dialog', { name: /cookie preferences/i })).toBeInTheDocument()
      })
    })
  })

  describe('Settings Modal', () => {
    it('should display all cookie categories in modal', async () => {
      const user = userEvent.setup()
      renderWithProviders(<CookieConsent />)

      await waitFor(
        () => {
          expect(screen.getByRole('button', { name: /customize/i })).toBeInTheDocument()
        },
        { timeout: 1500 }
      )

      await user.click(screen.getByRole('button', { name: /customize/i }))

      await waitFor(() => {
        expect(screen.getByText('Essential Cookies')).toBeInTheDocument()
      })
      expect(screen.getByText('Analytics Cookies')).toBeInTheDocument()
      expect(screen.getByText('Marketing Cookies')).toBeInTheDocument()
    })

    it('should have essential cookies switch disabled', async () => {
      const user = userEvent.setup()
      renderWithProviders(<CookieConsent />)

      await waitFor(
        () => {
          expect(screen.getByRole('button', { name: /customize/i })).toBeInTheDocument()
        },
        { timeout: 1500 }
      )

      await user.click(screen.getByRole('button', { name: /customize/i }))

      await waitFor(() => {
        expect(screen.getByText('Essential Cookies')).toBeInTheDocument()
      })

      const switches = screen.getAllByRole('switch')
      // First switch should be for Essential cookies and should be disabled
      expect(switches[0]).toBeDisabled()
      expect(switches[0]).toBeChecked()
    })

    it('should allow toggling analytics and marketing switches', async () => {
      const user = userEvent.setup()
      renderWithProviders(<CookieConsent />)

      await waitFor(
        () => {
          expect(screen.getByRole('button', { name: /customize/i })).toBeInTheDocument()
        },
        { timeout: 1500 }
      )

      await user.click(screen.getByRole('button', { name: /customize/i }))

      await waitFor(() => {
        expect(screen.getByText('Analytics Cookies')).toBeInTheDocument()
      })

      const switches = screen.getAllByRole('switch')
      // Analytics switch (second one)
      expect(switches[1]).not.toBeDisabled()
      expect(switches[1]).not.toBeChecked()

      await user.click(switches[1])
      expect(switches[1]).toBeChecked()
    })

    it('should save preferences when Save Preferences is clicked', async () => {
      const user = userEvent.setup()
      renderWithProviders(<CookieConsent />)

      await waitFor(
        () => {
          expect(screen.getByRole('button', { name: /customize/i })).toBeInTheDocument()
        },
        { timeout: 1500 }
      )

      await user.click(screen.getByRole('button', { name: /customize/i }))

      await waitFor(() => {
        expect(screen.getByText('Analytics Cookies')).toBeInTheDocument()
      })

      const switches = screen.getAllByRole('switch')
      await user.click(switches[1]) // Enable analytics

      const saveButton = screen.getByRole('button', { name: /save preferences/i })
      await user.click(saveButton)

      const stored = localStorage.getItem('kanbanium-cookie-consent')
      expect(stored).toBeTruthy()
      const parsed = JSON.parse(stored!)
      expect(parsed.analytics).toBe(true)
    })

    it('should close modal when cancel is clicked', async () => {
      const user = userEvent.setup()
      renderWithProviders(<CookieConsent />)

      await waitFor(
        () => {
          expect(screen.getByRole('button', { name: /customize/i })).toBeInTheDocument()
        },
        { timeout: 1500 }
      )

      await user.click(screen.getByRole('button', { name: /customize/i }))

      await waitFor(() => {
        expect(screen.getByRole('dialog', { name: /cookie preferences/i })).toBeInTheDocument()
      })

      // Click the X button to close modal
      const closeButton = screen.getByLabelText(/close/i)
      await user.click(closeButton)

      await waitFor(() => {
        expect(screen.queryByRole('dialog', { name: /cookie preferences/i })).not.toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', async () => {
      renderWithProviders(<CookieConsent />)

      await waitFor(
        () => {
          expect(screen.getByRole('dialog', { name: /cookie consent banner/i })).toBeInTheDocument()
        },
        { timeout: 1500 }
      )

      expect(screen.getByRole('dialog', { name: /cookie consent banner/i })).toBeInTheDocument()
    })

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup()
      renderWithProviders(<CookieConsent />)

      await waitFor(
        () => {
          expect(screen.getByRole('button', { name: /reject non-essential/i })).toBeInTheDocument()
        },
        { timeout: 1500 }
      )

      // Tab through buttons
      await user.tab()
      expect(screen.getByRole('button', { name: /reject non-essential/i })).toHaveFocus()

      await user.tab()
      expect(screen.getByRole('button', { name: /customize/i })).toHaveFocus()

      await user.tab()
      expect(screen.getByRole('button', { name: /accept all/i })).toHaveFocus()
    })
  })
})
