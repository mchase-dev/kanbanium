import { useState } from 'react'
import { Select, Space, Typography, Spin, Empty } from 'antd'
import { PlusOutlined, TagOutlined } from '@ant-design/icons'
import { useLabelsByBoard, useAddTaskLabel, useRemoveTaskLabel } from '../../hooks/useLabels'
import { LabelBadge } from './LabelBadge'
import type { TaskLabel } from '../../types/api'

const { Text } = Typography

interface LabelPickerProps {
  boardId: string
  taskId: string
  taskLabels: TaskLabel[]
}

export function LabelPicker({ boardId, taskId, taskLabels }: LabelPickerProps) {
  const [open, setOpen] = useState(false)

  const { data: allLabels, isLoading } = useLabelsByBoard(boardId)
  const addTaskLabel = useAddTaskLabel()
  const removeTaskLabel = useRemoveTaskLabel()

  const taskLabelIds = new Set(taskLabels.map((tl) => tl.labelId))

  // Available labels are those not already on the task
  const availableLabels = allLabels?.filter((label) => !taskLabelIds.has(label.id)) || []

  const handleAddLabel = async (labelId: string) => {
    try {
      await addTaskLabel.mutateAsync({ taskId, labelId })
      setOpen(false)
    } catch (error) {
      // Error handled by mutation
    }
  }

  const handleRemoveLabel = async (labelId: string) => {
    try {
      await removeTaskLabel.mutateAsync({ taskId, labelId })
    } catch (error) {
      // Error handled by mutation
    }
  }

  return (
    <div style={{ width: '100%' }}>
      <Space direction="vertical" style={{ width: '100%' }} size={8}>
        {/* Label Section Header */}
        <Space>
          <TagOutlined />
          <Text strong>Labels</Text>
        </Space>

        {/* Current Labels */}
        {taskLabels.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {taskLabels.map((tl) => (
              <LabelBadge
                key={tl.labelId}
                label={tl.label}
                closable
                onClose={() => handleRemoveLabel(tl.labelId)}
              />
            ))}
          </div>
        )}

        {/* Add Label Dropdown */}
        <Select
          open={open}
          onDropdownVisibleChange={setOpen}
          placeholder={
            <Space>
              <PlusOutlined />
              <span>Add label</span>
            </Space>
          }
          style={{ width: '100%' }}
          loading={isLoading}
          notFoundContent={
            isLoading ? (
              <Spin size="small" />
            ) : availableLabels.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No more labels available"
                style={{ padding: '20px 0' }}
              />
            ) : null
          }
          onChange={handleAddLabel}
          value={null}
          showSearch
          filterOption={(input, option) =>
            (option?.label?.toString() ?? '').toLowerCase().includes(input.toLowerCase())
          }
        >
          {availableLabels.map((label) => (
            <Select.Option key={label.id} value={label.id} label={label.name}>
              <LabelBadge label={label} />
            </Select.Option>
          ))}
        </Select>
      </Space>
    </div>
  )
}
