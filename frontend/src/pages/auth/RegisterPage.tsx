import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Form, Input, Button, Typography, Row, Col } from 'antd'
import { MailOutlined, LockOutlined, UserOutlined } from '@ant-design/icons'
import { useAuth } from '../../contexts/AuthContext'
import { AuthLayout } from '../../layouts/AuthLayout'
import type { RegisterRequest } from '../../types/api'

const { Title, Text } = Typography

export function RegisterPage() {
  const { register: registerUser, isAuthenticated } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form] = Form.useForm()

  const onSubmit = async (values: RegisterRequest & { confirmPassword: string }) => {
    setIsSubmitting(true)
    try {
      const { confirmPassword, ...registerData } = values
      await registerUser(registerData)
    } catch (error) {
      // Error is handled in auth context
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <AuthLayout>
      <Title level={2} style={{ textAlign: 'center', marginBottom: 24 }}>
        Create Account
      </Title>

      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
        autoComplete="off"
        size="large"
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="First Name"
              name="firstName"
              rules={[{ required: true, message: 'Please enter your first name' }]}
            >
              <Input prefix={<UserOutlined />} placeholder="John" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Last Name"
              name="lastName"
              rules={[{ required: true, message: 'Please enter your last name' }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Doe" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="Username"
          name="userName"
          rules={[
            { required: true, message: 'Please enter a username' },
            { min: 3, message: 'Username must be at least 3 characters' },
            { pattern: /^[a-zA-Z0-9_]+$/, message: 'Username can only contain letters, numbers, and underscores' },
          ]}
          extra="3+ characters, letters, numbers, and underscores only"
        >
          <Input prefix={<UserOutlined />} placeholder="johndoe" />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Please enter your email' },
            { type: 'email', message: 'Please enter a valid email' },
          ]}
        >
          <Input prefix={<MailOutlined />} placeholder="john@example.com" />
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

        <Form.Item
          label="Confirm Password"
          name="confirmPassword"
          dependencies={['password']}
          rules={[
            { required: true, message: 'Please confirm your password' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve()
                }
                return Promise.reject(new Error('Passwords do not match'))
              },
            }),
          ]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Confirm your password" />
        </Form.Item>

        <Form.Item style={{ marginBottom: 8 }}>
          <Button type="primary" htmlType="submit" loading={isSubmitting} block>
            Create Account
          </Button>
        </Form.Item>
      </Form>

      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <Text type="secondary">
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#1677ff', fontWeight: 600 }}>
            Sign In
          </Link>
        </Text>
      </div>
    </AuthLayout>
  )
}
