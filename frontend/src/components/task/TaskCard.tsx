import { Card, Typography, Tag, Space } from 'antd'
import { ClockCircleOutlined, FlagOutlined } from '@ant-design/icons'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { LabelBadge } from '../label/LabelBadge'
import { UserAvatar } from '../common/UserAvatar'
import type { TaskListDto } from '../../types/api'

const { Text } = Typography

interface TaskCardProps {
  task: TaskListDto
  onClick?: () => void
}

const priorityColors: Record<number, string> = {
  0: 'default', // Low
  1: 'blue', // Medium
  2: 'orange', // High
  3: 'red', // Critical
}

const priorityLabels: Record<number, string> = {
  0: 'Low',
  1: 'Medium',
  2: 'High',
  3: 'Critical',
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab',
  }

  const formatDueDate = (date: string | undefined) => {
    if (!date) return null
    const dueDate = new Date(date)
    const now = new Date()
    const isOverdue = dueDate < now

    return (
      <Space size={4}>
        <ClockCircleOutlined style={{ color: isOverdue ? '#ff4d4f' : '#999' }} />
        <Text type={isOverdue ? 'danger' : 'secondary'} style={{ fontSize: 12 }}>
          {dueDate.toLocaleDateString()}
        </Text>
      </Space>
    )
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card
        size="small"
        hoverable
        onClick={onClick}
        style={{
          marginBottom: 8,
          borderRadius: 6,
        }}
        bodyStyle={{ padding: 12 }}
      >
        <div style={{ marginBottom: 8 }}>
          <Text strong style={{ fontSize: 14 }}>
            {task.title}
          </Text>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 8,
          }}
        >
          <Space size={4}>
            {task.priority !== undefined && task.priority > 0 && (
              <Tag
                color={priorityColors[task.priority]}
                icon={<FlagOutlined />}
                style={{ margin: 0, fontSize: 11 }}
              >
                {priorityLabels[task.priority]}
              </Tag>
            )}

            {task.labels && task.labels.length > 0 && (
              <>
                {task.labels.slice(0, 2).map((taskLabel) => (
                  <LabelBadge
                    key={taskLabel.labelId}
                    label={taskLabel.label}
                    size="small"
                  />
                ))}
                {task.labels.length > 2 && (
                  <Tag style={{ margin: 2, fontSize: 11 }}>
                    +{task.labels.length - 2}
                  </Tag>
                )}
              </>
            )}
          </Space>

          <Space size={8}>
            {task.dueDate && formatDueDate(task.dueDate)}

            {task.assignee && <UserAvatar user={task.assignee} size={24} />}
          </Space>
        </div>
      </Card>
    </div>
  )
}
