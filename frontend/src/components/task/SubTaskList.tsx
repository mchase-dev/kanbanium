import { useState } from 'react'
import {
  List,
  Checkbox,
  Input,
  Button,
  Space,
  Typography,
  Progress,
  Popconfirm,
  Form,
} from 'antd'
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  CheckOutlined,
  CloseOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons'
import EmptyState from '../common/EmptyState'
import {
  useCreateSubTask,
  useUpdateSubTask,
  useDeleteSubTask,
  useToggleSubTask,
} from '../../hooks/useSubTasks'
import type { SubTask } from '../../types/api'

const { Text } = Typography

interface SubTaskListProps {
  taskId: string
  subTasks: SubTask[]
}

export function SubTaskList({ taskId, subTasks }: SubTaskListProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newSubTaskTitle, setNewSubTaskTitle] = useState('')
  const [editTitle, setEditTitle] = useState('')

  const createSubTask = useCreateSubTask()
  const updateSubTask = useUpdateSubTask()
  const deleteSubTask = useDeleteSubTask()
  const toggleSubTask = useToggleSubTask()

  // Calculate progress
  const totalSubTasks = subTasks.length
  const completedSubTasks = subTasks.filter((st) => st.isCompleted).length
  const progressPercent = totalSubTasks > 0 ? (completedSubTasks / totalSubTasks) * 100 : 0

  const handleAddSubTask = async () => {
    if (!newSubTaskTitle.trim()) return

    try {
      await createSubTask.mutateAsync({
        taskId,
        title: newSubTaskTitle.trim(),
      })
      setNewSubTaskTitle('')
      setIsAdding(false)
    } catch (error) {
      // Error handled by mutation
    }
  }

  const handleUpdateSubTask = async (id: string) => {
    if (!editTitle.trim()) return

    try {
      await updateSubTask.mutateAsync({
        id,
        data: {
          id,
          title: editTitle.trim(),
        },
      })
      setEditingId(null)
      setEditTitle('')
    } catch (error) {
      // Error handled by mutation
    }
  }

  const handleDeleteSubTask = async (id: string) => {
    try {
      await deleteSubTask.mutateAsync({ id, taskId })
    } catch (error) {
      // Error handled by mutation
    }
  }

  const handleToggleSubTask = async (id: string) => {
    try {
      await toggleSubTask.mutateAsync(id)
    } catch (error) {
      // Error handled by mutation
    }
  }

  const startEditing = (subTask: SubTask) => {
    setEditingId(subTask.id)
    setEditTitle(subTask.title)
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditTitle('')
  }

  return (
    <div style={{ width: '100%' }}>
      {/* Progress Section */}
      {totalSubTasks > 0 && (
        <div style={{ marginBottom: 16 }}>
          <Space direction="vertical" style={{ width: '100%' }} size={4}>
            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
              <Text strong>Progress</Text>
              <Text type="secondary">
                {completedSubTasks} of {totalSubTasks} completed
              </Text>
            </Space>
            <Progress
              percent={Math.round(progressPercent)}
              status={progressPercent === 100 ? 'success' : 'active'}
              showInfo={false}
            />
          </Space>
        </div>
      )}

      {/* SubTasks List */}
      {subTasks && subTasks.length > 0 ? (
        <List
          dataSource={subTasks}
          renderItem={(subTask) => {
          const isEditing = editingId === subTask.id

          return (
            <List.Item
              style={{
                padding: '8px 0',
                border: 'none',
              }}
            >
              <Space style={{ width: '100%' }} align="start">
                <Checkbox
                  checked={subTask.isCompleted}
                  onChange={() => handleToggleSubTask(subTask.id)}
                  disabled={toggleSubTask.isPending}
                />

                {isEditing ? (
                  <Space.Compact style={{ flex: 1 }}>
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onPressEnter={() => handleUpdateSubTask(subTask.id)}
                      autoFocus
                      placeholder="Subtask title"
                    />
                    <Button
                      type="primary"
                      icon={<CheckOutlined />}
                      onClick={() => handleUpdateSubTask(subTask.id)}
                      loading={updateSubTask.isPending}
                    />
                    <Button
                      icon={<CloseOutlined />}
                      onClick={cancelEditing}
                    />
                  </Space.Compact>
                ) : (
                  <div
                    style={{
                      flex: 1,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Text
                      style={{
                        textDecoration: subTask.isCompleted ? 'line-through' : 'none',
                        color: subTask.isCompleted ? '#999' : 'inherit',
                      }}
                    >
                      {subTask.title}
                    </Text>

                    <Space size={4}>
                      <Button
                        type="text"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => startEditing(subTask)}
                      />
                      <Popconfirm
                        title="Delete subtask"
                        description="Are you sure you want to delete this subtask?"
                        onConfirm={() => handleDeleteSubTask(subTask.id)}
                        okText="Delete"
                        cancelText="Cancel"
                        okButtonProps={{ danger: true }}
                      >
                        <Button
                          type="text"
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                          loading={deleteSubTask.isPending}
                        />
                      </Popconfirm>
                    </Space>
                  </div>
                )}
              </Space>
            </List.Item>
          )
        }}
      />
      ) : (
        <EmptyState
          title="No subtasks yet"
          description="Break down this task into smaller steps"
          icon={<UnorderedListOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />}
        />
      )}

      {/* Add SubTask Section */}
      {isAdding ? (
        <Form.Item style={{ marginTop: 8, marginBottom: 0 }}>
          <Space.Compact style={{ width: '100%' }}>
            <Input
              value={newSubTaskTitle}
              onChange={(e) => setNewSubTaskTitle(e.target.value)}
              onPressEnter={handleAddSubTask}
              placeholder="Enter subtask title..."
              autoFocus
            />
            <Button
              type="primary"
              icon={<CheckOutlined />}
              onClick={handleAddSubTask}
              loading={createSubTask.isPending}
            />
            <Button
              icon={<CloseOutlined />}
              onClick={() => {
                setIsAdding(false)
                setNewSubTaskTitle('')
              }}
            />
          </Space.Compact>
        </Form.Item>
      ) : (
        <Button
          type="dashed"
          block
          icon={<PlusOutlined />}
          onClick={() => setIsAdding(true)}
          style={{ marginTop: 8 }}
        >
          Add Subtask
        </Button>
      )}
    </div>
  )
}
