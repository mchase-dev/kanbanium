import { Timeline, Empty, Typography, Tag, Spin, Space } from 'antd'
import { ClockCircleOutlined } from '@ant-design/icons'
import { useTaskHistory } from '../../hooks/useTasks'
import { UserAvatar } from '../common/UserAvatar'
import { formatDistanceToNow } from 'date-fns'
import type { TaskHistoryDto } from '../../types/api'

const { Text } = Typography

interface TaskActivityProps {
  taskId: string
}

// Format field names to be more readable
const formatFieldName = (field?: string): string => {
  if (!field) return ''

  const fieldMap: Record<string, string> = {
    Title: 'title',
    Description: 'description',
    Priority: 'priority',
    DueDate: 'due date',
    StatusId: 'status',
    TypeId: 'type',
    AssigneeId: 'assignee',
    ColumnId: 'column',
    SprintId: 'sprint',
    IsArchived: 'archived status',
  }

  return fieldMap[field] || field.toLowerCase()
}

// Format priority values
const formatPriority = (value?: string): string => {
  if (!value) return 'None'
  const priorities: Record<string, string> = {
    '0': 'Low',
    '1': 'Medium',
    '2': 'High',
    '3': 'Critical',
  }
  return priorities[value] || value
}

// Format field values for display
const formatValue = (fieldName?: string, value?: string): string => {
  if (!value) return 'None'

  if (fieldName === 'Priority') {
    return formatPriority(value)
  }

  if (fieldName === 'IsArchived') {
    return value === 'True' ? 'Archived' : 'Active'
  }

  if (fieldName === 'DueDate') {
    try {
      return new Date(value).toLocaleDateString()
    } catch {
      return value
    }
  }

  return value
}

// Format activity message
const formatActivityMessage = (activity: TaskHistoryDto): React.ReactNode => {
  const { action, fieldName, oldValue, newValue, user } = activity
  const userName = `${user.firstName} ${user.lastName}`

  if (action === 'Created') {
    return (
      <span>
        <Text strong>{userName}</Text> created this task
      </span>
    )
  }

  if (action === 'Updated' && fieldName) {
    const field = formatFieldName(fieldName)
    const formattedOld = formatValue(fieldName, oldValue)
    const formattedNew = formatValue(fieldName, newValue)

    return (
      <span>
        <Text strong>{userName}</Text> changed {field} from{' '}
        <Tag style={{ margin: '0 4px' }}>{formattedOld}</Tag> to{' '}
        <Tag color="blue" style={{ margin: '0 4px' }}>
          {formattedNew}
        </Tag>
      </span>
    )
  }

  if (action === 'Deleted') {
    return (
      <span>
        <Text strong>{userName}</Text> deleted this task
      </span>
    )
  }

  if (action === 'Archived') {
    return (
      <span>
        <Text strong>{userName}</Text> archived this task
      </span>
    )
  }

  if (action === 'Unarchived') {
    return (
      <span>
        <Text strong>{userName}</Text> unarchived this task
      </span>
    )
  }

  if (action === 'Moved') {
    return (
      <span>
        <Text strong>{userName}</Text> moved this task{' '}
        {oldValue && newValue && (
          <>
            from <Tag style={{ margin: '0 4px' }}>{oldValue}</Tag> to{' '}
            <Tag color="blue" style={{ margin: '0 4px' }}>
              {newValue}
            </Tag>
          </>
        )}
      </span>
    )
  }

  // Fallback for unknown actions
  return (
    <span>
      <Text strong>{userName}</Text> {action.toLowerCase()} this task
    </span>
  )
}

export function TaskActivity({ taskId }: TaskActivityProps) {
  const { data: history = [], isLoading } = useTaskHistory(taskId)

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <Spin />
      </div>
    )
  }

  if (history.length === 0) {
    return (
      <Empty
        description="No activity yet"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        style={{ padding: '40px 0' }}
      />
    )
  }

  const timelineItems = history.map((activity) => ({
    key: activity.id,
    dot: <UserAvatar user={activity.user} size="small" />,
    children: (
      <div style={{ paddingBottom: 16 }}>
        <div style={{ marginBottom: 4 }}>{formatActivityMessage(activity)}</div>
        <Space size={4} style={{ fontSize: 12, color: '#999' }}>
          <ClockCircleOutlined />
          <Text type="secondary">
            {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
          </Text>
        </Space>
      </div>
    ),
  }))

  return (
    <div style={{ padding: '16px 0' }}>
      <Timeline items={timelineItems} />
    </div>
  )
}
