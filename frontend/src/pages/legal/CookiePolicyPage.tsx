import { Card, Button, Typography } from 'antd'
import { Link } from 'react-router-dom'
import { useCookieConsent } from '../../contexts/CookieConsentContext'

const { Title, Paragraph, Text } = Typography

export default function CookiePolicyPage() {
  const { openSettings } = useCookieConsent()

  return (
    <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
      <Card>
        <Typography>
          <Title level={1}>Cookie Policy</Title>
          <Paragraph>
            <Text strong>Last Updated:</Text> {new Date().toLocaleDateString()}
          </Paragraph>

          <Paragraph>
            This Cookie Policy explains how Kanbanium ("we", "us", or "our") uses cookies and
            similar technologies when you visit our website. By using our website, you agree to the
            use of cookies as described in this policy.
          </Paragraph>

          <Title level={2}>What Are Cookies?</Title>
          <Paragraph>
            Cookies are small text files that are stored on your device (computer, tablet, or
            mobile) when you visit a website. They help websites remember your preferences and
            provide a better user experience.
          </Paragraph>

          <Title level={2}>Types of Cookies We Use</Title>

          <Title level={3}>1. Essential Cookies (Always Active)</Title>
          <Paragraph>
            These cookies are necessary for the website to function properly and cannot be disabled.
            They enable core functionality such as:
          </Paragraph>
          <ul>
            <li>
              <strong>Authentication:</strong> Keeping you logged in as you navigate through the
              application
            </li>
            <li>
              <strong>Security:</strong> Protecting against cross-site request forgery (CSRF)
              attacks
            </li>
            <li>
              <strong>Session Management:</strong> Managing your active session and maintaining
              state
            </li>
            <li>
              <strong>Cookie Consent:</strong> Remembering your cookie preferences
            </li>
          </ul>
          <Paragraph>
            <Text strong>Cookies Used:</Text>
          </Paragraph>
          <ul>
            <li>
              <code>.AspNetCore.Identity.Application</code> - Authentication cookie (HTTP-only,
              secure)
            </li>
            <li>
              <code>X-CSRF-TOKEN</code> - Anti-forgery token for security (HTTP-only, secure)
            </li>
            <li>
              <code>kanbanium-cookie-consent</code> - Stores your cookie preferences (localStorage)
            </li>
          </ul>

          <Title level={3}>2. Analytics Cookies (Optional)</Title>
          <Paragraph>
            These cookies help us understand how visitors interact with our website by collecting
            and reporting information anonymously. This helps us:
          </Paragraph>
          <ul>
            <li>Understand which features are most used</li>
            <li>Identify areas for improvement</li>
            <li>Analyze user behavior patterns</li>
            <li>Optimize the user experience</li>
          </ul>
          <Paragraph>
            <Text type="secondary">
              Note: Analytics cookies are currently not implemented but may be added in the future.
            </Text>
          </Paragraph>

          <Title level={3}>3. Marketing Cookies (Optional)</Title>
          <Paragraph>
            Marketing cookies track visitors across websites to display relevant and engaging
            advertisements. These cookies may share information with third-party advertisers.
          </Paragraph>
          <Paragraph>
            <Text type="secondary">
              Note: Marketing cookies are currently not implemented.
            </Text>
          </Paragraph>

          <Title level={2}>Cookie Lifespan</Title>
          <Paragraph>Different cookies have different lifespans:</Paragraph>
          <ul>
            <li>
              <strong>Session Cookies:</strong> Deleted when you close your browser
            </li>
            <li>
              <strong>Persistent Cookies:</strong> Remain until expiry date or manual deletion
            </li>
            <li>
              <strong>Authentication Cookie:</strong> 1 hour with sliding expiration
            </li>
            <li>
              <strong>Consent Preferences:</strong> Stored indefinitely until you clear them
            </li>
          </ul>

          <Title level={2}>Managing Your Cookie Preferences</Title>
          <Paragraph>You have full control over which cookies you accept:</Paragraph>
          <ul>
            <li>
              <strong>Cookie Banner:</strong> Choose your preferences when you first visit the site
            </li>
            <li>
              <strong>Cookie Settings:</strong>{' '}
              <Button type="link" onClick={openSettings} style={{ padding: 0 }}>
                Click here to update your preferences
              </Button>
            </li>
            <li>
              <strong>Browser Settings:</strong> Configure cookie settings in your browser
            </li>
            <li>
              <strong>Clear Cookies:</strong> Delete cookies through your browser settings
            </li>
          </ul>

          <Title level={2}>Browser Cookie Controls</Title>
          <Paragraph>Most browsers allow you to:</Paragraph>
          <ul>
            <li>View and delete cookies</li>
            <li>Block third-party cookies</li>
            <li>Block all cookies (may affect functionality)</li>
            <li>Clear cookies when closing the browser</li>
          </ul>
          <Paragraph>
            For instructions on managing cookies in your browser, visit your browser's help section:
          </Paragraph>
          <ul>
            <li>
              <a
                href="https://support.google.com/chrome/answer/95647"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google Chrome
              </a>
            </li>
            <li>
              <a
                href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop"
                target="_blank"
                rel="noopener noreferrer"
              >
                Mozilla Firefox
              </a>
            </li>
            <li>
              <a
                href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac"
                target="_blank"
                rel="noopener noreferrer"
              >
                Apple Safari
              </a>
            </li>
            <li>
              <a
                href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
                target="_blank"
                rel="noopener noreferrer"
              >
                Microsoft Edge
              </a>
            </li>
          </ul>

          <Title level={2}>Third-Party Cookies</Title>
          <Paragraph>
            We do not currently use third-party cookies. If we implement analytics or marketing
            services in the future, we will update this policy and request your consent.
          </Paragraph>

          <Title level={2}>Updates to This Policy</Title>
          <Paragraph>
            We may update this Cookie Policy from time to time to reflect changes in our practices
            or for legal, regulatory, or operational reasons. We will notify you of any material
            changes by posting the updated policy on this page with a new "Last Updated" date.
          </Paragraph>

          <Title level={2}>Contact Us</Title>
          <Paragraph>
            If you have questions about our use of cookies or this Cookie Policy, please contact us
            at:
          </Paragraph>
          <Paragraph>
            <strong>Email:</strong> privacy@kanbanium.com
            <br />
            <strong>Website:</strong> <Link to="/">https://kanbanium.com</Link>
          </Paragraph>

          <Title level={2}>Related Policies</Title>
          <ul>
            <li>
              <Link to="/privacy">Privacy Policy</Link>
            </li>
            <li>
              <Link to="/terms">Terms of Service</Link>
            </li>
          </ul>
        </Typography>
      </Card>
    </div>
  )
}
