import { Modal, Form, Input, Select } from 'antd'
import { useCreateUser } from '../../hooks/useUsers'
import type { CreateUserRequest } from '../../types/api'

interface CreateUserModalProps {
  open: boolean
  onClose: () => void
}

export function CreateUserModal({ open, onClose }: CreateUserModalProps) {
  const [form] = Form.useForm()
  const createUserMutation = useCreateUser()

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const request: CreateUserRequest = {
        userName: values.userName,
        email: values.email,
        firstName: values.firstName,
        lastName: values.lastName,
        password: values.password,
        role: values.role,
      }
      await createUserMutation.mutateAsync(request)
      form.resetFields()
      onClose()
    } catch (error) {
      // Form validation error or mutation error - handled by hooks
    }
  }

  const handleCancel = () => {
    form.resetFields()
    onClose()
  }

  return (
    <Modal
      title="Create User"
      open={open}
      onOk={handleSubmit}
      onCancel={handleCancel}
      okText="Create"
      confirmLoading={createUserMutation.isPending}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        autoComplete="off"
      >
        <Form.Item
          name="userName"
          label="Username"
          rules={[
            { required: true, message: 'Please enter a username' },
            { min: 3, message: 'Username must be at least 3 characters' },
            { pattern: /^[a-zA-Z0-9_-]+$/, message: 'Username can only contain letters, numbers, hyphens, and underscores' },
          ]}
        >
          <Input placeholder="Enter username" />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Please enter an email' },
            { type: 'email', message: 'Please enter a valid email' },
          ]}
        >
          <Input placeholder="Enter email address" />
        </Form.Item>

        <Form.Item
          name="firstName"
          label="First Name"
          rules={[{ required: true, message: 'Please enter first name' }]}
        >
          <Input placeholder="Enter first name" />
        </Form.Item>

        <Form.Item
          name="lastName"
          label="Last Name"
          rules={[{ required: true, message: 'Please enter last name' }]}
        >
          <Input placeholder="Enter last name" />
        </Form.Item>

        <Form.Item
          name="password"
          label="Password"
          rules={[
            { required: true, message: 'Please enter a password' },
            { min: 6, message: 'Password must be at least 6 characters' },
          ]}
        >
          <Input.Password placeholder="Enter password" />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label="Confirm Password"
          dependencies={['password']}
          rules={[
            { required: true, message: 'Please confirm the password' },
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
          <Input.Password placeholder="Confirm password" />
        </Form.Item>

        <Form.Item
          name="role"
          label="Role"
          rules={[{ required: true, message: 'Please select a role' }]}
        >
          <Select
            placeholder="Select a role"
            options={[
              { label: 'User', value: 'User' },
              { label: 'Manager', value: 'Manager' },
              { label: 'Admin', value: 'Admin' },
              { label: 'Superuser', value: 'Superuser' },
            ]}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}
