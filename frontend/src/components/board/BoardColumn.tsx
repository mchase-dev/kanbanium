import { Card, Typography, Button, Space, Badge } from 'antd'
import { PlusOutlined, MoreOutlined } from '@ant-design/icons'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { TaskCard } from '../task/TaskCard'
import type { ColumnDto, TaskListDto } from '../../types/api'

const { Text } = Typography

interface BoardColumnProps {
  column: ColumnDto
  tasks: TaskListDto[]
  onAddTask?: () => void
  onTaskClick?: (task: TaskListDto) => void
}

export function BoardColumn({ column, tasks, onAddTask, onTaskClick }: BoardColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  })

  const taskIds = tasks.map((task) => task.id)

  return (
    <Card
      style={{
        width: 320,
        minWidth: 320,
        height: 'fit-content',
        maxHeight: 'calc(100vh - 220px)',
        display: 'flex',
        flexDirection: 'column',
        background: isOver ? '#f0f5ff' : '#fafafa',
        transition: 'background 0.2s',
      }}
      bodyStyle={{
        padding: 12,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      {/* Column Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
          padding: '0 4px',
        }}
      >
        <Space size={8}>
          <Text strong style={{ fontSize: 14 }}>
            {column.name}
          </Text>
          <Badge
            count={tasks.length}
            style={{
              backgroundColor: '#f0f0f0',
              color: '#666',
              boxShadow: 'none',
            }}
          />
        </Space>

        <Button type="text" size="small" icon={<MoreOutlined />} />
      </div>

      {/* Task List */}
      <div
        ref={setNodeRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '4px 0',
          minHeight: 100,
        }}
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => onTaskClick?.(task)}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: '#999',
            }}
          >
            <Text type="secondary" style={{ fontSize: 12 }}>
              No tasks in this column
            </Text>
          </div>
        )}
      </div>

      {/* Add Task Button */}
      <Button
        type="dashed"
        block
        icon={<PlusOutlined />}
        onClick={onAddTask}
        style={{ marginTop: 8 }}
      >
        Add Task
      </Button>
    </Card>
  )
}
