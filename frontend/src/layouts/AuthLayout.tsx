import type { ReactNode } from 'react'
import { Layout, Card, Typography } from 'antd'

const { Content } = Layout
const { Title, Text } = Typography

interface AuthLayoutProps {
  children: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <Layout
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <Content style={{ maxWidth: 480, width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={1} style={{ color: '#fff', marginBottom: 8 }}>
            Kanbanium
          </Title>
          <Text style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: 16 }}>
            Organize your work, achieve your goals
          </Text>
        </div>

        <Card style={{ borderRadius: 8, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)' }}>
          {children}
        </Card>
      </Content>
    </Layout>
  )
}
