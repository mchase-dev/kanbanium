import { Typography, Button, Space, Dropdown } from 'antd'
import { MoreOutlined, TeamOutlined, PlusOutlined, SettingOutlined, TagOutlined } from '@ant-design/icons'
import type { Board } from '../../types/api'
import type { MenuProps } from 'antd'

const { Title, Text } = Typography

interface BoardHeaderProps {
  board: Board
  onAddColumn?: () => void
  onManageMembers?: () => void
  onManageLabels?: () => void
  onSettings?: () => void
  onArchive?: () => void
  onDelete?: () => void
}

export function BoardHeader({
  board,
  onAddColumn,
  onManageMembers,
  onManageLabels,
  onSettings,
  onArchive,
  onDelete,
}: BoardHeaderProps) {
  const menuItems: MenuProps['items'] = [
    {
      key: 'labels',
      label: 'Manage Labels',
      icon: <TagOutlined />,
      onClick: onManageLabels,
    },
    {
      key: 'settings',
      label: 'Board Settings',
      icon: <SettingOutlined />,
      onClick: onSettings,
    },
    {
      key: 'archive',
      label: board.isArchived ? 'Unarchive Board' : 'Archive Board',
      onClick: onArchive,
    },
    {
      type: 'divider',
    },
    {
      key: 'delete',
      label: 'Delete Board',
      danger: true,
      onClick: onDelete,
    },
  ]

  return (
    <div
      style={{
        padding: '16px 24px',
        borderBottom: '1px solid #f0f0f0',
        background: '#fff',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <Title level={3} style={{ margin: 0, marginBottom: 4 }}>
            {board.name}
          </Title>
          {board.description && (
            <Text type="secondary">{board.description}</Text>
          )}
        </div>

        <Space size="middle">
          <Button icon={<TeamOutlined />} onClick={onManageMembers}>
            Members
          </Button>

          <Button type="primary" icon={<PlusOutlined />} onClick={onAddColumn}>
            Add Column
          </Button>

          <Dropdown menu={{ items: menuItems }} trigger={['click']}>
            <Button icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      </div>
    </div>
  )
}
