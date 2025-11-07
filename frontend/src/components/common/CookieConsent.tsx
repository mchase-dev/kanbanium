import { useState, useEffect } from 'react'
import { Modal, Button, Switch, Space } from 'antd'
import { Link } from 'react-router-dom'
import { useCookieConsent, type CookiePreferences } from '../../contexts/CookieConsentContext'
import './CookieConsent.css'

export function CookieConsent() {
  const {
    preferences,
    hasConsented,
    acceptAll,
    acceptSelected,
    rejectNonEssential,
    isSettingsOpen,
    openSettings,
    closeSettings,
  } = useCookieConsent()

  const [customPreferences, setCustomPreferences] = useState<CookiePreferences>(preferences)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Show banner after a short delay if user hasn't consented
    if (!hasConsented) {
      const timer = setTimeout(() => setIsVisible(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [hasConsented])

  useEffect(() => {
    setCustomPreferences(preferences)
  }, [preferences])

  if (hasConsented && !isSettingsOpen) {
    return null
  }

  const handleAcceptAll = () => {
    acceptAll()
    setIsVisible(false)
  }

  const handleRejectNonEssential = () => {
    rejectNonEssential()
    setIsVisible(false)
  }

  const handleSavePreferences = () => {
    acceptSelected(customPreferences)
    setIsVisible(false)
  }

  const handleOpenSettings = () => {
    openSettings()
  }

  const handleCloseSettings = () => {
    closeSettings()
    setCustomPreferences(preferences)
  }

  return (
    <>
      {/* Cookie Consent Banner */}
      {isVisible && !isSettingsOpen && (
        <div className="cookie-consent-banner" role="dialog" aria-label="Cookie consent banner">
          <div className="cookie-consent-content">
            <div className="cookie-consent-text">
              <h3>We Value Your Privacy</h3>
              <p>
                We use cookies to enhance your browsing experience, analyze site traffic, and
                personalize content. By clicking "Accept All", you consent to our use of cookies.{' '}
                <Link to="/cookie-policy" className="cookie-link">
                  Cookie Policy
                </Link>{' '}
                |{' '}
                <Link to="/privacy" className="cookie-link">
                  Privacy Policy
                </Link>
              </p>
            </div>
            <div className="cookie-consent-actions">
              <Space>
                <Button onClick={handleRejectNonEssential} className="cookie-btn-reject">
                  Reject Non-Essential
                </Button>
                <Button onClick={handleOpenSettings} className="cookie-btn-customize">
                  Customize
                </Button>
                <Button type="primary" onClick={handleAcceptAll} className="cookie-btn-accept">
                  Accept All
                </Button>
              </Space>
            </div>
          </div>
        </div>
      )}

      {/* Cookie Settings Modal */}
      <Modal
        title="Cookie Preferences"
        open={isSettingsOpen}
        onCancel={handleCloseSettings}
        footer={[
          <Button key="reject" onClick={handleRejectNonEssential}>
            Reject Non-Essential
          </Button>,
          <Button key="save" type="primary" onClick={handleSavePreferences}>
            Save Preferences
          </Button>,
        ]}
        width={600}
      >
        <div className="cookie-settings">
          <div className="cookie-category">
            <div className="cookie-category-header">
              <div>
                <h4>Essential Cookies</h4>
                <p className="cookie-category-description">
                  Required for the website to function properly. These cookies enable core
                  functionality such as security, authentication, and network management. They
                  cannot be disabled.
                </p>
              </div>
              <Switch checked disabled />
            </div>
          </div>

          <div className="cookie-category">
            <div className="cookie-category-header">
              <div>
                <h4>Analytics Cookies</h4>
                <p className="cookie-category-description">
                  Help us understand how visitors interact with our website by collecting and
                  reporting information anonymously. This helps us improve the user experience.
                </p>
              </div>
              <Switch
                checked={customPreferences.analytics}
                onChange={(checked) =>
                  setCustomPreferences({ ...customPreferences, analytics: checked })
                }
              />
            </div>
          </div>

          <div className="cookie-category">
            <div className="cookie-category-header">
              <div>
                <h4>Marketing Cookies</h4>
                <p className="cookie-category-description">
                  Used to track visitors across websites to display relevant and engaging
                  advertisements. These cookies may share information with third-party advertisers.
                </p>
              </div>
              <Switch
                checked={customPreferences.marketing}
                onChange={(checked) =>
                  setCustomPreferences({ ...customPreferences, marketing: checked })
                }
              />
            </div>
          </div>

          <div className="cookie-policy-links">
            <p>
              For more information about how we use cookies, please read our{' '}
              <Link to="/cookie-policy">Cookie Policy</Link> and{' '}
              <Link to="/privacy">Privacy Policy</Link>.
            </p>
          </div>
        </div>
      </Modal>
    </>
  )
}
