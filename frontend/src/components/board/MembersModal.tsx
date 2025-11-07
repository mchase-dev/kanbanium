import { useState } from 'react'
import {
  Modal,
  List,
  Space,
  Typography,
  Button,
  Select,
  Popconfirm,
  Form,
  Divider,
  Tag,
  AutoComplete,
} from 'antd'
import {
  UserOutlined,
  UserAddOutlined,
  DeleteOutlined,
  CrownOutlined,
} from '@ant-design/icons'
import { UserAvatar } from '../common/UserAvatar'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import {
  useBoardMembers,
  useAddBoardMember,
  useRemoveBoardMember,
  useUpdateMemberRole,
} from '../../hooks/useBoards'
import { useSearchUsers } from '../../hooks/useUsers'
import { useAuth } from '../../contexts/AuthContext'
import type { BoardRole } from '../../types/api'

dayjs.extend(relativeTime)

const { Text } = Typography

interface MembersModalProps {
  open: boolean
  onClose: () => void
  boardId: string
}

const roleOptions = [
  { value: 0, label: 'Viewer', description: 'Can view board' },
  { value: 1, label: 'Member', description: 'Can edit tasks' },
  { value: 2, label: 'Admin', description: 'Can manage board' },
]

const getRoleBadge = (role: BoardRole) => {
  const roleMap = {
    0: { text: 'Viewer', color: 'default' },
    1: { text: 'Member', color: 'blue' },
    2: { text: 'Admin', color: 'gold' },
  }
  const badge = roleMap[role] || { text: 'Unknown', color: 'default' }
  return <Tag color={badge.color}>{badge.text}</Tag>
}

export function MembersModal({ open, onClose, boardId }: MembersModalProps) {
  const [form] = Form.useForm()
  const [isAddingMember, setIsAddingMember] = useState(false)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const { user: currentUser } = useAuth()

  const { data: members, isLoading } = useBoardMembers(boardId)
  const { data: searchResults } = useSearchUsers(searchTerm)
  const addMember = useAddBoardMember()
  const removeMember = useRemoveBoardMember()
  const updateRole = useUpdateMemberRole()

  const currentUserMember = members?.find((m) => m.userId === currentUser?.id)
  const isAdmin = currentUserMember?.role === 2

  const handleAddMember = async (values: any) => {
    try {
      await addMember.mutateAsync({
        boardId,
        data: {
          boardId,
          userId: values.userId,
          role: values.role as BoardRole,
        },
      })
      form.resetFields()
      setIsAddingMember(false)
    } catch (error) {
      // Error handled by mutation
    }
  }

  const handleRemoveMember = async (userId: string) => {
    try {
      await removeMember.mutateAsync({ boardId, userId })
    } catch (error) {
      // Error handled by mutation
    }
  }

  const handleRoleChange = async (userId: string, newRole: BoardRole) => {
    try {
      await updateRole.mutateAsync({
        boardId,
        userId,
        data: {
          boardId,
          userId,
          role: newRole,
        },
      })
    } catch (error) {
      // Error handled by mutation
    }
  }

  return (
    <Modal
      title={
        <Space>
          <UserOutlined />
          Board Members ({members?.length || 0})
        </Space>
      }
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
      ]}
      width={600}
    >
      {/* Add Member Form */}
      {isAdmin && (
        <>
          {!isAddingMember ? (
            <Button
              type="dashed"
              block
              icon={<UserAddOutlined />}
              onClick={() => setIsAddingMember(true)}
              style={{ marginBottom: 16 }}
            >
              Add Member
            </Button>
          ) : (
            <Form
              form={form}
              layout="vertical"
              onFinish={handleAddMember}
              autoComplete="off"
              style={{ marginBottom: 16 }}
            >
              <Form.Item
                label="Username or Email"
                name="userId"
                rules={[{ required: true, message: 'Please select a user' }]}
              >
                <AutoComplete
                  placeholder="Search by username or email"
                  onSearch={setSearchTerm}
                  options={searchResults?.map((user) => ({
                    value: user.userName,
                    label: (
                      <Space>
                        <UserAvatar user={user} size={24} />
                        <div>
                          <div>
                            <Text strong>{user.firstName} {user.lastName}</Text>
                            {' '}
                            <Text type="secondary">@{user.userName}</Text>
                          </div>
                          <div>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {user.email}
                            </Text>
                          </div>
                        </div>
                      </Space>
                    ),
                  })) || []}
                  filterOption={false}
                />
              </Form.Item>

              <Form.Item
                label="Role"
                name="role"
                initialValue={1}
                rules={[{ required: true, message: 'Please select a role' }]}
              >
                <Select optionLabelProp="label">
                  {roleOptions.map((opt) => (
                    <Select.Option key={opt.value} value={opt.value} label={opt.label}>
                      <div>
                        <div><Text strong>{opt.label}</Text></div>
                        <div>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {opt.description}
                          </Text>
                        </div>
                      </div>
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={addMember.isPending}
                >
                  Add
                </Button>
                <Button onClick={() => {
                  setIsAddingMember(false)
                  form.resetFields()
                }}>
                  Cancel
                </Button>
              </Space>
            </Form>
          )}
          <Divider />
        </>
      )}

      {/* Members List */}
      <List
        loading={isLoading}
        dataSource={members}
        renderItem={(member) => {
          const isCurrentUser = member.userId === currentUser?.id
          const canRemove = isAdmin && !isCurrentUser

          return (
            <List.Item
              actions={[
                isAdmin && !isCurrentUser ? (
                  <Select
                    key="role"
                    value={member.role}
                    onChange={(newRole) => handleRoleChange(member.userId, newRole)}
                    style={{ width: 120 }}
                    size="small"
                    loading={updateRole.isPending}
                  >
                    {roleOptions.map((opt) => (
                      <Select.Option key={opt.value} value={opt.value}>
                        {opt.label}
                      </Select.Option>
                    ))}
                  </Select>
                ) : (
                  getRoleBadge(member.role)
                ),
                canRemove && (
                  <Popconfirm
                    key="remove"
                    title="Remove member"
                    description="Are you sure you want to remove this member?"
                    onConfirm={() => handleRemoveMember(member.userId)}
                    okText="Remove"
                    cancelText="Cancel"
                    okButtonProps={{ danger: true }}
                  >
                    <Button
                      type="text"
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      loading={removeMember.isPending}
                    />
                  </Popconfirm>
                ),
              ].filter(Boolean)}
            >
              <List.Item.Meta
                avatar={<UserAvatar user={member.user} />}
                title={
                  <Space>
                    {member.user.firstName} {member.user.lastName}
                    {isCurrentUser && (
                      <Tag color="green" style={{ margin: 0 }}>
                        You
                      </Tag>
                    )}
                    {member.role === 2 && (
                      <CrownOutlined style={{ color: '#faad14' }} />
                    )}
                  </Space>
                }
                description={
                  <Space direction="vertical" size={0}>
                    <Text type="secondary">{member.user.email}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Joined {dayjs(member.joinedAt).fromNow()}
                    </Text>
                  </Space>
                }
              />
            </List.Item>
          )
        }}
      />
    </Modal>
  )
}
