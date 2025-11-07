import { Card, Typography, Tag } from 'antd'
import { CheckSquareOutlined, InboxOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import type { BoardListDto } from '../../types/api'

const { Text, Title } = Typography

interface BoardCardProps {
  board: BoardListDto
}

export function BoardCard({ board }: BoardCardProps) {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(`/boards/${board.id}`)
  }

  return (
    <Card
      hoverable
      onClick={handleClick}
      style={{ height: '100%' }}
    >
      <Title level={4} style={{ marginBottom: 12 }}>
        {board.name}
      </Title>

      {board.description && (
        <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
          {board.description.length > 100
            ? `${board.description.substring(0, 100)}...`
            : board.description}
        </Text>
      )}

      <div style={{ display: 'flex', gap: 16, marginTop: 16, flexWrap: 'nowrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
          <InboxOutlined style={{ color: '#666' }} />
          <Text type="secondary">{board.columnCount || 0} columns</Text>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
          <CheckSquareOutlined style={{ color: '#666' }} />
          <Text type="secondary">{board.taskCount || 0} tasks</Text>
        </div>
      </div>

      {board.isArchived && (
        <Tag color="warning" style={{ marginTop: 12 }}>
          Archived
        </Tag>
      )}
    </Card>
  )
}
