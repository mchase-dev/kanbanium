import { useState } from 'react'
import {
  Table,
  Space,
  Button,
  Input,
  Select,
  Switch,
  Tag,
  Typography,
  Card,
  Dropdown,
  Modal,
} from 'antd'
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  StopOutlined,
  CheckCircleOutlined,
  MoreOutlined,
} from '@ant-design/icons'
import type { User } from '../../types/api'
import { useGetAllUsers, useDisableUser, useEnableUser } from '../../hooks/useUsers'
import { CreateUserModal } from '../../components/user/CreateUserModal'
import { EditUserModal } from '../../components/user/EditUserModal'
import { DashboardLayout } from '../../layouts/DashboardLayout'

const { Title } = Typography

export function UsersPage() {
  const [searchTerm, setSearchTerm] = useState<string>()
  const [roleFilter, setRoleFilter] = useState<string>()
  const [includeDeleted, setIncludeDeleted] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User>()

  const { data, isLoading } = useGetAllUsers({
    searchTerm,
    role: roleFilter,
    includeDeleted,
    page,
    pageSize,
  })

  const disableUserMutation = useDisableUser()
  const enableUserMutation = useEnableUser()

  const handleDisableUser = (userId: string, userName: string) => {
    Modal.confirm({
      title: 'Disable User',
      content: `Are you sure you want to disable ${userName}? They will no longer be able to access the system.`,
      okText: 'Disable',
      okType: 'danger',
      onOk: () => disableUserMutation.mutate(userId),
    })
  }

  const handleEnableUser = (userId: string, userName: string) => {
    Modal.confirm({
      title: 'Enable User',
      content: `Are you sure you want to enable ${userName}? They will regain access to the system.`,
      okText: 'Enable',
      onOk: () => enableUserMutation.mutate(userId),
    })
  }

  const handleEdit = (user: User) => {
    setSelectedUser(user)
    setEditModalOpen(true)
  }

  const handleTableChange = (pagination: TablePaginationConfig) => {
    setPage(pagination.current || 1)
    setPageSize(pagination.pageSize || 20)
  }

  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'Superuser':
        return 'red'
      case 'Admin':
        return 'orange'
      case 'Manager':
        return 'blue'
      case 'User':
        return 'green'
      default:
        return 'default'
    }
  }

  const columns: ColumnsType<User> = [
    {
      title: 'Username',
      dataIndex: 'userName',
      key: 'userName',
      width: 150,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 200,
    },
    {
      title: 'Name',
      key: 'name',
      width: 180,
      render: (_, record) => `${record.firstName} ${record.lastName}`,
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      width: 120,
      render: (role: string) => <Tag color={getRoleColor(role)}>{role || 'N/A'}</Tag>,
    },
    {
      title: 'Status',
      key: 'status',
      width: 100,
      render: (_, record) =>
        record.isDeleted ? (
          <Tag color="red">Disabled</Tag>
        ) : (
          <Tag color="green">Active</Tag>
        ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Last Login',
      dataIndex: 'lastLoginAt',
      key: 'lastLoginAt',
      width: 120,
      render: (date?: string) => (date ? new Date(date).toLocaleDateString() : 'Never'),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_, record) => {
        const menuItems = [
          {
            key: 'edit',
            label: 'Edit',
            icon: <EditOutlined />,
            onClick: () => handleEdit(record),
          },
          ...(record.isDeleted
            ? [
                {
                  key: 'enable',
                  label: 'Enable',
                  icon: <CheckCircleOutlined />,
                  onClick: () => handleEnableUser(record.id, record.userName),
                },
              ]
            : [
                {
                  key: 'disable',
                  label: 'Disable',
                  icon: <StopOutlined />,
                  danger: true,
                  onClick: () => handleDisableUser(record.id, record.userName),
                },
              ]),
        ]

        return (
          <Space size="small">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
            <Dropdown menu={{ items: menuItems }} trigger={['click']}>
              <Button type="text" size="small" icon={<MoreOutlined />} />
            </Dropdown>
          </Space>
        )
      },
    },
  ]

  return (
    <DashboardLayout>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={2} style={{ margin: 0 }}>
            User Management
          </Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalOpen(true)}>
            Create User
          </Button>
        </div>

        <Card>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Space wrap>
              <Input
                placeholder="Search by name, username, or email"
                prefix={<SearchOutlined />}
                allowClear
                style={{ width: 300 }}
                onChange={(e) => setSearchTerm(e.target.value || undefined)}
              />
              <Select
                placeholder="Filter by role"
                allowClear
                style={{ width: 150 }}
                onChange={(value) => setRoleFilter(value)}
                options={[
                  { label: 'User', value: 'User' },
                  { label: 'Manager', value: 'Manager' },
                  { label: 'Admin', value: 'Admin' },
                  { label: 'Superuser', value: 'Superuser' },
                ]}
              />
              <Space>
                <span>Include Disabled:</span>
                <Switch checked={includeDeleted} onChange={setIncludeDeleted} />
              </Space>
            </Space>

            <Table<User>
              columns={columns}
              dataSource={data?.items || []}
              rowKey="id"
              loading={isLoading}
              pagination={{
                current: page,
                pageSize: pageSize,
                total: data?.totalCount || 0,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} users`,
              }}
              onChange={handleTableChange}
              scroll={{ x: 1200 }}
            />
          </Space>
        </Card>
      </Space>

      <CreateUserModal open={createModalOpen} onClose={() => setCreateModalOpen(false)} />

      {selectedUser && (
        <EditUserModal
          user={selectedUser}
          open={editModalOpen}
          onClose={() => {
            setEditModalOpen(false)
            setSelectedUser(undefined)
          }}
        />
      )}
    </DashboardLayout>
  )
}
