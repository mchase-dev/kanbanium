import { Tag } from 'antd'
import { CloseOutlined } from '@ant-design/icons'
import type { Label } from '../../types/api'

interface LabelBadgeProps {
  label: Label
  closable?: boolean
  onClose?: () => void
  size?: 'small' | 'default'
}

export function LabelBadge({ label, closable = false, onClose, size = 'default' }: LabelBadgeProps) {
  // Safety check - return null if label is undefined
  if (!label) {
    return null
  }

  // Calculate contrast color for text (black or white based on background)
  const getContrastColor = (hexColor: string) => {
    // Remove # if present
    const hex = hexColor.replace('#', '')

    // Convert to RGB
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)

    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

    // Return black for light backgrounds, white for dark
    return luminance > 0.5 ? '#000000' : '#FFFFFF'
  }

  return (
    <Tag
      color={label.color}
      closable={closable}
      onClose={(e) => {
        e.preventDefault()
        onClose?.()
      }}
      closeIcon={<CloseOutlined />}
      style={{
        color: getContrastColor(label.color),
        fontWeight: 500,
        border: 'none',
        fontSize: size === 'small' ? 11 : 12,
        padding: size === 'small' ? '0 4px' : '2px 8px',
        margin: 2,
      }}
    >
      {label.name}
    </Tag>
  )
}
