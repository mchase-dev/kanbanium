import { useEffect } from 'react'
import { Modal, Form, Input, InputNumber } from 'antd'
import { useCreateColumn } from '../../hooks/useBoards'

interface AddColumnModalProps {
  open: boolean
  onClose: () => void
  boardId: string
}

export function AddColumnModal({ open, onClose, boardId }: AddColumnModalProps) {
  const [form] = Form.useForm()
  const createColumn = useCreateColumn()

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      form.resetFields()
    }
  }, [open, form])

  const handleSubmit = async (values: any) => {
    try {
      await createColumn.mutateAsync({
        boardId,
        data: {
          boardId,
          name: values.name,
          wipLimit: values.wipLimit,
        },
      })
      form.resetFields()
      onClose()
    } catch (error) {
      // Error handled by mutation
    }
  }

  const handleCancel = () => {
    form.resetFields()
    onClose()
  }

  return (
    <Modal
      title="Add Column"
      open={open}
      onCancel={handleCancel}
      onOk={() => form.submit()}
      okText="Create"
      cancelText="Cancel"
      confirmLoading={createColumn.isPending}
      width={500}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        <Form.Item
          label="Column Name"
          name="name"
          rules={[
            { required: true, message: 'Please enter a column name' },
            { max: 100, message: 'Column name must be less than 100 characters' },
          ]}
        >
          <Input placeholder="e.g., To Do, In Progress, Done" size="large" autoFocus />
        </Form.Item>

        <Form.Item
          label="WIP Limit (optional)"
          name="wipLimit"
          tooltip="Work In Progress limit - maximum number of tasks allowed in this column"
          rules={[
            { type: 'number', min: 1, message: 'WIP limit must be at least 1' },
            { type: 'number', max: 999, message: 'WIP limit must be less than 1000' },
          ]}
        >
          <InputNumber
            placeholder="No limit"
            style={{ width: '100%' }}
            min={1}
            max={999}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}
