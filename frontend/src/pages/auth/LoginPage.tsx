import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Form, Input, Button, Typography } from 'antd'
import { MailOutlined, LockOutlined } from '@ant-design/icons'
import { useAuth } from '../../contexts/AuthContext'
import { AuthLayout } from '../../layouts/AuthLayout'
import type { LoginRequest } from '../../types/api'

const { Title, Text } = Typography

export function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form] = Form.useForm()

  console.log('LoginPage render, isAuthenticated:', isAuthenticated)

  const onSubmit = async (values: LoginRequest) => {
    setIsSubmitting(true)
    try {
      console.log('Calling login...')
      await login(values)
      console.log('Login completed')
    } catch (error) {
      // Error is handled in auth context
      console.error('Login error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isAuthenticated) {
    console.log('User is authenticated, redirecting to dashboard')
    return <Navigate to="/dashboard" replace />
  }

  return (
    <AuthLayout>
      <Title level={2} style={{ textAlign: 'center', marginBottom: 24 }}>
        Sign In
      </Title>

      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
        autoComplete="off"
        size="large"
      >
        <Form.Item
          label="Email or Username"
          name="email"
          rules={[
            { required: true, message: 'Please enter your email or username' },
          ]}
        >
          <Input prefix={<MailOutlined />} placeholder="Enter your email or username" autoComplete="username" />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[
            { required: true, message: 'Please enter your password' },
            { min: 6, message: 'Password must be at least 6 characters' },
          ]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Enter your password" />
        </Form.Item>

        <Form.Item style={{ marginBottom: 8 }}>
          <Button type="primary" htmlType="submit" loading={isSubmitting} block>
            Sign In
          </Button>
        </Form.Item>
      </Form>

      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <Text type="secondary">
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#1677ff', fontWeight: 600 }}>
            Sign Up
          </Link>
        </Text>
      </div>
    </AuthLayout>
  )
}
