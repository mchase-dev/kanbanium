import { Button, List, Typography, Space } from 'antd'
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons'
import { useAuth } from '../../contexts/AuthContext'
import { useAddWatcher, useRemoveWatcher } from '../../hooks/useTasks'
import { UserAvatar } from '../common/UserAvatar'
import EmptyState from '../common/EmptyState'
import type { Watcher } from '../../types/api'

const { Text } = Typography

interface TaskWatchersProps {
  taskId: string
  watchers: Watcher[]
}

export function TaskWatchers({ taskId, watchers }: TaskWatchersProps) {
  const { user } = useAuth()
  const addWatcher = useAddWatcher()
  const removeWatcher = useRemoveWatcher()

  const isWatching = watchers?.some((w) => w.userId === user?.id)

  const handleToggleWatch = async () => {
    if (isWatching) {
      await removeWatcher.mutateAsync(taskId)
    } else {
      await addWatcher.mutateAsync(taskId)
    }
  }

  return (
    <div style={{ padding: '16px 0' }}>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {/* Watch/Unwatch Button */}
        <div>
          <Button
            type={isWatching ? 'default' : 'primary'}
            icon={isWatching ? <EyeInvisibleOutlined /> : <EyeOutlined />}
            onClick={handleToggleWatch}
            loading={addWatcher.isPending || removeWatcher.isPending}
            block
          >
            {isWatching ? 'Unwatch' : 'Watch'}
          </Button>
          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 8 }}>
            {isWatching
              ? 'You are watching this task and will be notified of updates'
              : 'Watch this task to receive notifications about updates'}
          </Text>
        </div>

        {/* Watchers List */}
        {watchers && watchers.length > 0 ? (
          <div>
            <Text strong style={{ fontSize: 14, marginBottom: 8, display: 'block' }}>
              Watchers ({watchers.length})
            </Text>
            <List
              dataSource={watchers}
              renderItem={(watcher) => (
                <List.Item style={{ padding: '8px 0', border: 'none' }}>
                  <List.Item.Meta
                    avatar={<UserAvatar user={watcher.user} size="small" />}
                    title={
                      <Space size={4}>
                        <Text>
                          {watcher.user.firstName} {watcher.user.lastName}
                        </Text>
                        {watcher.userId === user?.id && (
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            (You)
                          </Text>
                        )}
                      </Space>
                    }
                    description={
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        @{watcher.user.userName}
                      </Text>
                    }
                  />
                </List.Item>
              )}
            />
          </div>
        ) : (
          <EmptyState
            title="No watchers yet"
            description="Be the first to watch this task for updates"
            icon={<EyeOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />}
          />
        )}
      </Space>
    </div>
  )
}
