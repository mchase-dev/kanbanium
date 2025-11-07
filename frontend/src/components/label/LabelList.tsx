import { useState } from 'react'
import {
  List,
  Button,
  Space,
  Typography,
  Input,
  Popconfirm,
  Form,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  BgColorsOutlined,
} from '@ant-design/icons'
import {
  useLabelsByBoard,
  useCreateLabel,
  useUpdateLabel,
  useDeleteLabel,
} from '../../hooks/useLabels'
import { LabelBadge } from './LabelBadge'
import type { LabelDto } from '../../types/api'

const { Text } = Typography

interface LabelListProps {
  boardId: string
}

const PRESET_COLORS = [
  '#f5222d', // red
  '#fa541c', // volcano
  '#fa8c16', // orange
  '#faad14', // gold
  '#fadb14', // yellow
  '#a0d911', // lime
  '#52c41a', // green
  '#13c2c2', // cyan
  '#1677ff', // blue
  '#2f54eb', // geekblue
  '#722ed1', // purple
  '#eb2f96', // magenta
]

export function LabelList({ boardId }: LabelListProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [editingLabel, setEditingLabel] = useState<LabelDto | null>(null)
  const [form] = Form.useForm()

  const { data: labels, isLoading } = useLabelsByBoard(boardId)
  const createLabel = useCreateLabel()
  const updateLabel = useUpdateLabel()
  const deleteLabel = useDeleteLabel()

  const handleCreate = async (values: { name: string; color: string }) => {
    try {
      await createLabel.mutateAsync({
        boardId,
        name: values.name,
        color: values.color,
      })
      form.resetFields()
      setIsCreating(false)
    } catch (error) {
      // Error handled by mutation
    }
  }

  const handleUpdate = async (values: { name: string; color: string }) => {
    if (!editingLabel) return

    try {
      await updateLabel.mutateAsync({
        id: editingLabel.id,
        boardId,
        data: {
          name: values.name,
          color: values.color,
        },
      })
      setEditingLabel(null)
      form.resetFields()
    } catch (error) {
      // Error handled by mutation
    }
  }

  const handleDelete = async (labelId: string) => {
    try {
      await deleteLabel.mutateAsync({ id: labelId, boardId })
    } catch (error) {
      // Error handled by mutation
    }
  }

  const startEdit = (label: LabelDto) => {
    setEditingLabel(label)
    form.setFieldsValue({
      name: label.name,
      color: label.color,
    })
  }

  const cancelEdit = () => {
    setEditingLabel(null)
    setIsCreating(false)
    form.resetFields()
  }

  const LabelForm = ({ onFinish }: { onFinish: (values: any) => void }) => {
    const [selectedColor, setSelectedColor] = useState(
      form.getFieldValue('color') || PRESET_COLORS[0]
    )

    return (
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
        initialValues={{ color: PRESET_COLORS[0] }}
      >
        <Form.Item
          label="Label Name"
          name="name"
          rules={[
            { required: true, message: 'Please enter label name' },
            { max: 50, message: 'Label name must be less than 50 characters' },
          ]}
        >
          <Input placeholder="Enter label name" maxLength={50} />
        </Form.Item>

        <Form.Item
          label="Color"
          name="color"
          rules={[{ required: true, message: 'Please select a color' }]}
        >
          <div>
            <Space wrap style={{ marginBottom: 8 }}>
              {PRESET_COLORS.map((color) => (
                <div
                  key={color}
                  onClick={() => {
                    form.setFieldValue('color', color)
                    setSelectedColor(color)
                  }}
                  style={{
                    width: 32,
                    height: 32,
                    backgroundColor: color,
                    borderRadius: 4,
                    cursor: 'pointer',
                    border: selectedColor === color ? '3px solid #000' : '1px solid #d9d9d9',
                    transition: 'all 0.2s',
                  }}
                />
              ))}
            </Space>
            <Input
              prefix={<BgColorsOutlined />}
              placeholder="#000000"
              value={selectedColor}
              onChange={(e) => {
                const value = e.target.value
                form.setFieldValue('color', value)
                setSelectedColor(value)
              }}
              maxLength={7}
            />
          </div>
        </Form.Item>

        <Space>
          <Button
            type="primary"
            htmlType="submit"
            loading={createLabel.isPending || updateLabel.isPending}
          >
            {editingLabel ? 'Update' : 'Create'}
          </Button>
          <Button onClick={cancelEdit}>Cancel</Button>
        </Space>
      </Form>
    )
  }

  return (
    <div style={{ width: '100%' }}>
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {/* Create Label Button */}
        {!isCreating && !editingLabel && (
          <Button
            type="dashed"
            block
            icon={<PlusOutlined />}
            onClick={() => setIsCreating(true)}
          >
            Create Label
          </Button>
        )}

        {/* Create/Edit Form */}
        {(isCreating || editingLabel) && (
          <div
            style={{
              padding: 16,
              border: '1px solid #d9d9d9',
              borderRadius: 8,
              backgroundColor: '#fafafa',
            }}
          >
            <Text strong style={{ display: 'block', marginBottom: 16 }}>
              {editingLabel ? 'Edit Label' : 'Create New Label'}
            </Text>
            <LabelForm onFinish={editingLabel ? handleUpdate : handleCreate} />
          </div>
        )}

        {/* Labels List */}
        <List
          loading={isLoading}
          dataSource={labels}
          locale={{ emptyText: 'No labels yet. Create one to get started!' }}
          renderItem={(label) => (
            <List.Item
              actions={[
                <Button
                  key="edit"
                  type="text"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => startEdit(label)}
                />,
                <Popconfirm
                  key="delete"
                  title="Delete label"
                  description="This will remove the label from all tasks. Continue?"
                  onConfirm={() => handleDelete(label.id)}
                  okText="Delete"
                  cancelText="Cancel"
                  okButtonProps={{ danger: true }}
                >
                  <Button
                    type="text"
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    loading={deleteLabel.isPending}
                  />
                </Popconfirm>,
              ]}
            >
              <LabelBadge label={label} />
            </List.Item>
          )}
        />
      </Space>
    </div>
  )
}
