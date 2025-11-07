import { Modal, Form, Input } from 'antd'
import { useCreateBoard } from '../../hooks/useBoards'
import { useNavigate } from 'react-router-dom'
import type { CreateBoardRequest } from '../../types/api'

const { TextArea } = Input

interface CreateBoardModalProps {
  open: boolean
  onCancel: () => void
}

export function CreateBoardModal({ open, onCancel }: CreateBoardModalProps) {
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const createBoard = useCreateBoard()

  const handleSubmit = async (values: CreateBoardRequest) => {
    try {
      const board = await createBoard.mutateAsync(values)
      form.resetFields()
      onCancel()
      // Navigate to the newly created board
      navigate(`/boards/${board.id}`)
    } catch (error) {
      // Error is handled by the mutation
    }
  }

  const handleCancel = () => {
    form.resetFields()
    onCancel()
  }

  return (
    <Modal
      title="Create New Board"
      open={open}
      onCancel={handleCancel}
      onOk={() => form.submit()}
      confirmLoading={createBoard.isPending}
      okText="Create Board"
      cancelText="Cancel"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        <Form.Item
          label="Board Name"
          name="name"
          rules={[
            { required: true, message: 'Please enter a board name' },
            { max: 100, message: 'Board name must be less than 100 characters' },
          ]}
        >
          <Input placeholder="e.g. Product Roadmap" />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          rules={[
            { max: 500, message: 'Description must be less than 500 characters' },
          ]}
        >
          <TextArea
            rows={4}
            placeholder="What is this board for?"
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}
