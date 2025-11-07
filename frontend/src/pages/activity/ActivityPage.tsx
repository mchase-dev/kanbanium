import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Timeline,
  Typography,
  Space,
  Select,
  Button,
  Empty,
  Spin,
  Tag,
  Card,
} from 'antd'
import {
  HistoryOutlined,
  FolderOutlined,
} from '@ant-design/icons'
import { DashboardLayout } from '../../layouts/DashboardLayout'
import { useActivity } from '../../hooks/useActivity'
import { useBoards } from '../../hooks/useBoards'
import { UserAvatar } from '../../components/common/UserAvatar'
import type { ActivityDto } from '../../types/api'
import { formatDistanceToNow } from 'date-fns'

const { Title, Text } = Typography

const actionTypes = [
  { value: 'Created', label: 'Created' },
  { value: 'Updated', label: 'Updated' },
  { value: 'Moved', label: 'Moved' },
  { value: 'Deleted', label: 'Deleted' },
  { value: 'Archived', label: 'Archived' },
  { value: 'Unarchived', label: 'Unarchived' },
  { value: 'Assigned', label: 'Assigned' },
]

export function ActivityPage() {
  const navigate = useNavigate()
  const [boardFilter, setBoardFilter] = useState<string | undefined>()
  const [actionFilter, setActionFilter] = useState<string | undefined>()
  const [limit, setLimit] = useState(50)

  const { data: boards } = useBoards()
  const { data: activities, isLoading } = useActivity({
    boardId: boardFilter,
    actionType: actionFilter,
    limit,
  })

  const formatActivityMessage = (activity: ActivityDto): React.ReactNode => {
    const { action, fieldName, oldValue, newValue, user, taskTitle } = activity

    if (action === 'Created') {
      return (
        <span>
          <Text strong>{user.firstName} {user.lastName}</Text> created task{' '}
          <Text strong style={{ cursor: 'pointer' }} onClick={() => navigate(`/boards/${activity.boardId}?taskId=${activity.taskId}`)}>
            {taskTitle}
          </Text>
        </span>
      )
    }

    if (action === 'Deleted') {
      return (
        <span>
          <Text strong>{user.firstName} {user.lastName}</Text> deleted task <Text delete>{taskTitle}</Text>
        </span>
      )
    }

    if (action === 'Archived') {
      return (
        <span>
          <Text strong>{user.firstName} {user.lastName}</Text> archived task{' '}
          <Text strong style={{ cursor: 'pointer' }} onClick={() => navigate(`/boards/${activity.boardId}?taskId=${activity.taskId}`)}>
            {taskTitle}
          </Text>
        </span>
      )
    }

    if (action === 'Unarchived') {
      return (
        <span>
          <Text strong>{user.firstName} {user.lastName}</Text> unarchived task{' '}
          <Text strong style={{ cursor: 'pointer' }} onClick={() => navigate(`/boards/${activity.boardId}?taskId=${activity.taskId}`)}>
            {taskTitle}
          </Text>
        </span>
      )
    }

    if (action === 'Moved') {
      return (
        <span>
          <Text strong>{user.firstName} {user.lastName}</Text> moved task{' '}
          <Text strong style={{ cursor: 'pointer' }} onClick={() => navigate(`/boards/${activity.boardId}?taskId=${activity.taskId}`)}>
            {taskTitle}
          </Text>
        </span>
      )
    }

    if (action === 'Updated' && fieldName) {
      return (
        <span>
          <Text strong>{user.firstName} {user.lastName}</Text> updated{' '}
          <Text code>{fieldName}</Text> on task{' '}
          <Text strong style={{ cursor: 'pointer' }} onClick={() => navigate(`/boards/${activity.boardId}?taskId=${activity.taskId}`)}>
            {taskTitle}
          </Text>
          {oldValue && newValue && (
            <>
              {' '}from <Tag color="red">{oldValue}</Tag> to <Tag color="green">{newValue}</Tag>
            </>
          )}
        </span>
      )
    }

    return (
      <span>
        <Text strong>{user.firstName} {user.lastName}</Text> performed action <Text code>{action}</Text> on task{' '}
        <Text strong style={{ cursor: 'pointer' }} onClick={() => navigate(`/boards/${activity.boardId}?taskId=${activity.taskId}`)}>
          {taskTitle}
        </Text>
      </span>
    )
  }

  return (
    <DashboardLayout>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ marginBottom: 24 }}>
          <Title level={2}>
            <HistoryOutlined style={{ marginRight: 12 }} />
            Activity Feed
          </Title>
          <Text type="secondary">Recent activity across all your boards</Text>
        </div>

      {/* Filters */}
      <Space style={{ marginBottom: 24 }} wrap>
        <Select
          placeholder="Filter by board"
          style={{ width: 250 }}
          allowClear
          value={boardFilter}
          onChange={setBoardFilter}
        >
          {boards?.map((board) => (
            <Select.Option key={board.id} value={board.id}>
              <Space>
                <FolderOutlined />
                {board.name}
              </Space>
            </Select.Option>
          ))}
        </Select>

        <Select
          placeholder="Filter by action"
          style={{ width: 200 }}
          allowClear
          value={actionFilter}
          onChange={setActionFilter}
        >
          {actionTypes.map((action) => (
            <Select.Option key={action.value} value={action.value}>
              {action.label}
            </Select.Option>
          ))}
        </Select>

        <Select
          value={limit}
          style={{ width: 150 }}
          onChange={setLimit}
        >
          <Select.Option value={25}>Last 25</Select.Option>
          <Select.Option value={50}>Last 50</Select.Option>
          <Select.Option value={100}>Last 100</Select.Option>
        </Select>

        {(boardFilter || actionFilter) && (
          <Button
            onClick={() => {
              setBoardFilter(undefined)
              setActionFilter(undefined)
            }}
          >
            Clear Filters
          </Button>
        )}
      </Space>

      {/* Activity Timeline */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <Spin size="large" />
        </div>
      ) : activities && activities.length > 0 ? (
        <Card>
          <Timeline
            items={activities.map((activity) => ({
              key: activity.id,
              dot: <UserAvatar user={activity.user} size="small" />,
              children: (
                <div>
                  <div style={{ marginBottom: 4 }}>{formatActivityMessage(activity)}</div>
                  <Space size={12}>
                    <Space size={4}>
                      <FolderOutlined style={{ fontSize: 12, color: '#999' }} />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {activity.boardName}
                      </Text>
                    </Space>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                    </Text>
                  </Space>
                </div>
              ),
            }))}
          />
        </Card>
      ) : (
        <Empty
          description={
            boardFilter || actionFilter
              ? 'No activity matches the selected filters'
              : 'No recent activity'
          }
          style={{ padding: 60 }}
        />
      )}
      </div>
    </DashboardLayout>
  )
}
