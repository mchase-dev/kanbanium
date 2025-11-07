import { useEffect } from 'react'
import { Modal, Form, Input, Select } from 'antd'
import { useUpdateUser } from '../../hooks/useUsers'
import type { User, UpdateUserRequest } from '../../types/api'

interface EditUserModalProps {
  user: User
  open: boolean
  onClose: () => void
}

export function EditUserModal({ user, open, onClose }: EditUserModalProps) {
  const [form] = Form.useForm()
  const updateUserMutation = useUpdateUser()

  useEffect(() => {
    if (open && user) {
      form.setFieldsValue({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      })
    }
  }, [open, user, form])

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const request: UpdateUserRequest = {
        userId: user.id,
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        role: values.role,
      }
      await updateUserMutation.mutateAsync(request)
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
      title="Edit User"
      open={open}
      onOk={handleSubmit}
      onCancel={handleCancel}
      okText="Update"
      confirmLoading={updateUserMutation.isPending}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        autoComplete="off"
      >
        <Form.Item label="Username">
          <Input value={user.userName} disabled />
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
