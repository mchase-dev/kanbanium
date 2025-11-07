import { Layout, Typography, Card, Space, Button } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useNavigate, Link } from 'react-router-dom'

const { Content } = Layout
const { Title, Paragraph, Text } = Typography

export default function PrivacyPolicyPage() {
  const navigate = useNavigate()

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            style={{ marginBottom: '16px' }}
          >
            Back
          </Button>

          <Card>
            <Title level={1}>Privacy Policy</Title>
            <Text type="secondary">Last Updated: January 2025</Text>

            <Title level={2} style={{ marginTop: '32px' }}>
              1. Introduction
            </Title>
            <Paragraph>
              Welcome to Kanbanium. We are committed to protecting your personal information and
              your right to privacy. This Privacy Policy explains how we collect, use, disclose,
              and safeguard your information when you use our project management application.
            </Paragraph>

            <Title level={2}>2. Information We Collect</Title>
            <Title level={3}>2.1 Personal Information</Title>
            <Paragraph>
              We collect personal information that you voluntarily provide to us when you register
              on the application, including:
            </Paragraph>
            <ul>
              <li>Name and email address</li>
              <li>Username and password</li>
              <li>Profile information (optional)</li>
              <li>Communication preferences</li>
            </ul>

            <Title level={3}>2.2 Usage Data</Title>
            <Paragraph>
              We automatically collect certain information when you visit, use, or navigate our
              application:
            </Paragraph>
            <ul>
              <li>Device and browser information</li>
              <li>IP address and location data</li>
              <li>Usage patterns and feature interactions</li>
              <li>Performance metrics and error logs</li>
            </ul>

            <Title level={3}>2.3 Project Data</Title>
            <Paragraph>
              We collect and store information you create within the application:
            </Paragraph>
            <ul>
              <li>Boards, sprints, and tasks you create</li>
              <li>Comments and activity logs</li>
              <li>File attachments and uploads</li>
              <li>Team collaboration data</li>
            </ul>

            <Title level={2}>3. How We Use Your Information</Title>
            <Paragraph>We use your information to:</Paragraph>
            <ul>
              <li>
                <strong>Provide Services:</strong> Create and manage your account, process your
                requests, and deliver the features you use
              </li>
              <li>
                <strong>Improve Experience:</strong> Analyze usage patterns to enhance functionality
                and user experience
              </li>
              <li>
                <strong>Communication:</strong> Send you updates, security alerts, and support
                messages
              </li>
              <li>
                <strong>Security:</strong> Monitor and prevent fraudulent activity, unauthorized
                access, and security threats
              </li>
              <li>
                <strong>Legal Compliance:</strong> Comply with applicable laws and regulations
              </li>
            </ul>

            <Title level={2}>4. How We Share Your Information</Title>
            <Paragraph>We may share your information in the following situations:</Paragraph>
            <ul>
              <li>
                <strong>With Team Members:</strong> Project data is shared with collaborators you
                invite to your boards
              </li>
              <li>
                <strong>Service Providers:</strong> We use third-party services for hosting,
                analytics, and infrastructure
              </li>
              <li>
                <strong>Legal Requirements:</strong> When required by law or to protect our rights
              </li>
              <li>
                <strong>Business Transfers:</strong> In connection with any merger, sale, or
                transfer of assets
              </li>
            </ul>
            <Paragraph>
              <Text strong>We do not sell your personal information to third parties.</Text>
            </Paragraph>

            <Title level={2}>5. Data Security</Title>
            <Paragraph>
              We implement appropriate technical and organizational security measures to protect
              your personal information:
            </Paragraph>
            <ul>
              <li>Encrypted data transmission using HTTPS/TLS</li>
              <li>Secure password hashing using industry standards</li>
              <li>Regular security audits and vulnerability assessments</li>
              <li>Access controls and authentication requirements</li>
              <li>Secure cookie handling (HttpOnly, Secure, SameSite flags)</li>
            </ul>
            <Paragraph>
              However, no method of transmission over the internet is 100% secure. While we strive
              to protect your information, we cannot guarantee absolute security.
            </Paragraph>

            <Title level={2}>6. Data Retention</Title>
            <Paragraph>
              We retain your personal information for as long as necessary to fulfill the purposes
              outlined in this Privacy Policy, unless a longer retention period is required by law.
              When you delete your account, we will delete or anonymize your personal information
              within 30 days.
            </Paragraph>

            <Title level={2}>7. Your Privacy Rights</Title>
            <Paragraph>Depending on your location, you may have the following rights:</Paragraph>
            <ul>
              <li>
                <strong>Access:</strong> Request a copy of the personal information we hold about
                you
              </li>
              <li>
                <strong>Correction:</strong> Request correction of inaccurate or incomplete data
              </li>
              <li>
                <strong>Deletion:</strong> Request deletion of your personal information
              </li>
              <li>
                <strong>Portability:</strong> Request transfer of your data to another service
              </li>
              <li>
                <strong>Objection:</strong> Object to processing of your personal information
              </li>
              <li>
                <strong>Withdraw Consent:</strong> Withdraw consent for data processing at any time
              </li>
            </ul>
            <Paragraph>
              To exercise these rights, please contact us using the information provided below.
            </Paragraph>

            <Title level={2}>8. Cookies and Tracking Technologies</Title>
            <Paragraph>
              We use cookies and similar tracking technologies to track activity on our application
              and store certain information. You can manage your cookie preferences through our{' '}
              <Link to="/cookie-policy">Cookie Policy</Link> and cookie consent banner.
            </Paragraph>

            <Title level={2}>9. Third-Party Services</Title>
            <Paragraph>
              Our application may contain links to third-party websites or services. We are not
              responsible for the privacy practices of these third parties. We encourage you to
              review their privacy policies before providing any personal information.
            </Paragraph>

            <Title level={2}>10. Children's Privacy</Title>
            <Paragraph>
              Our application is not intended for children under the age of 13. We do not knowingly
              collect personal information from children under 13. If you believe we have collected
              information from a child under 13, please contact us immediately.
            </Paragraph>

            <Title level={2}>11. International Data Transfers</Title>
            <Paragraph>
              Your information may be transferred to and processed in countries other than your
              country of residence. These countries may have data protection laws that are different
              from your country. We ensure appropriate safeguards are in place to protect your
              information.
            </Paragraph>

            <Title level={2}>12. Updates to This Policy</Title>
            <Paragraph>
              We may update this Privacy Policy from time to time. We will notify you of any
              changes by posting the new Privacy Policy on this page and updating the "Last Updated"
              date. You are advised to review this Privacy Policy periodically for any changes.
            </Paragraph>

            <Title level={2}>13. Contact Us</Title>
            <Paragraph>
              If you have any questions about this Privacy Policy or our privacy practices, please
              contact us at:
            </Paragraph>
            <Paragraph>
              <strong>Email:</strong> privacy@kanbanium.com
              <br />
              <strong>Website:</strong> kanbanium.com
            </Paragraph>

            <Title level={2}>14. GDPR Compliance (EU Users)</Title>
            <Paragraph>
              If you are located in the European Economic Area (EEA), we process your personal data
              based on the following legal grounds:
            </Paragraph>
            <ul>
              <li>Your consent</li>
              <li>Performance of a contract with you</li>
              <li>Compliance with legal obligations</li>
              <li>Our legitimate interests</li>
            </ul>

            <Title level={2}>15. CCPA Compliance (California Users)</Title>
            <Paragraph>
              If you are a California resident, you have additional rights under the California
              Consumer Privacy Act (CCPA):
            </Paragraph>
            <ul>
              <li>Right to know what personal information is collected</li>
              <li>Right to know if personal information is sold or disclosed</li>
              <li>Right to say no to the sale of personal information</li>
              <li>Right to access your personal information</li>
              <li>Right to equal service and price</li>
            </ul>
          </Card>

          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            size="large"
          >
            Back
          </Button>
        </Space>
      </Content>
    </Layout>
  )
}
