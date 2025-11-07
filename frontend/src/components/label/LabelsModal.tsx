import { Modal } from 'antd'
import { LabelList } from './LabelList'

interface LabelsModalProps {
  boardId: string
  open: boolean
  onClose: () => void
}

export function LabelsModal({ boardId, open, onClose }: LabelsModalProps) {
  return (
    <Modal
      title="Manage Labels"
      open={open}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      <LabelList boardId={boardId} />
    </Modal>
  )
}
