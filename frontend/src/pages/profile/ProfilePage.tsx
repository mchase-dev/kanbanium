import { useState } from 'react'
import { Card, Form, Input, Button, Space, Typography, Alert, message } from 'antd'
import { MailOutlined, SaveOutlined, EditOutlined } from '@ant-design/icons'
import { DashboardLayout } from '../../layouts/DashboardLayout'
import { useAuth } from '../../contexts/AuthContext'
import { authApi } from '../../api/auth'
import { UserAvatar } from '../../components/common/UserAvatar'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const { Title, Text } = Typography

export function ProfilePage() {
  const { user, setUser } = useAuth()
  const [form] = Form.useForm()
  const [isEditing, setIsEditing] = useState(false)
  const queryClient = useQueryClient()

  const updateProfileMutation = useMutation({
    mutationFn: authApi.updateProfile,
    onSuccess: (updatedUser) => {
      setUser(updatedUser)
      queryClient.invalidateQueries({ queryKey: ['user', 'current'] })
      message.success('Profile updated successfully')
      setIsEditing(false)
    },
    onError: (error: any) => {
      message.error(error.response?.data?.errors?.join(', ') || 'Failed to update profile')
    },
  })

  if (!user) {
    return (
      <DashboardLayout>
        <Card>
          <Alert
            message="Not Logged In"
            description="You need to be logged in to view your profile."
            type="warning"
            showIcon
          />
        </Card>
      </DashboardLayout>
    )
  }

  const handleSubmit = async (values: any) => {
    await updateProfileMutation.mutateAsync({
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
    })
  }

  const handleCancel = () => {
    form.setFieldsValue({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    })
    setIsEditing(false)
  }

  return (
    <DashboardLayout>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={2} style={{ margin: 0 }}>Profile</Title>
            {!isEditing && (
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </Button>
            )}
          </div>

          <Card>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div style={{ textAlign: 'center', paddingBottom: 16 }}>
                <UserAvatar
                  user={user}
                  size={100}
                />
                <div style={{ marginTop: 12 }}>
                  <Text strong style={{ fontSize: 18 }}>
                    {user.firstName} {user.lastName}
                  </Text>
                  <br />
                  <Text type="secondary">@{user.userName}</Text>
                </div>
              </div>

              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                autoComplete="off"
                initialValues={{
                  firstName: user.firstName,
                  lastName: user.lastName,
                  email: user.email,
                }}
                disabled={!isEditing}
              >
                <Form.Item
                  label="First Name"
                  name="firstName"
                  rules={[
                    { required: true, message: 'Please enter your first name' },
                    { max: 100, message: 'First name must be less than 100 characters' },
                  ]}
                >
                  <Input size="large" />
                </Form.Item>

                <Form.Item
                  label="Last Name"
                  name="lastName"
                  rules={[
                    { required: true, message: 'Please enter your last name' },
                    { max: 100, message: 'Last name must be less than 100 characters' },
                  ]}
                >
                  <Input size="large" />
                </Form.Item>

                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    { required: true, message: 'Please enter your email' },
                    { type: 'email', message: 'Please enter a valid email' },
                    { max: 255, message: 'Email must be less than 255 characters' },
                  ]}
                >
                  <Input prefix={<MailOutlined />} size="large" />
                </Form.Item>

                <Form.Item
                  label="Username"
                >
                  <Input value={user.userName} disabled size="large" />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Username cannot be changed
                  </Text>
                </Form.Item>

                {user.role && (
                  <Form.Item label="Role">
                    <Input value={user.role} disabled size="large" />
                  </Form.Item>
                )}

                {isEditing && (
                  <Form.Item>
                    <Space>
                      <Button
                        type="primary"
                        htmlType="submit"
                        icon={<SaveOutlined />}
                        loading={updateProfileMutation.isPending}
                      >
                        Save Changes
                      </Button>
                      <Button onClick={handleCancel}>
                        Cancel
                      </Button>
                    </Space>
                  </Form.Item>
                )}
              </Form>
            </Space>
          </Card>
        </Space>
      </div>
    </DashboardLayout>
  )
}
