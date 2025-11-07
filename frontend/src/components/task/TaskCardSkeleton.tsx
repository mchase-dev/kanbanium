import { Card, Skeleton, Space } from 'antd';

/**
 * Skeleton loader for task cards in board columns
 */
export default function TaskCardSkeleton() {
  return (
    <Card
      size="small"
      style={{
        marginBottom: 8,
        cursor: 'default',
      }}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="small">
        {/* Task title */}
        <Skeleton.Input active style={{ width: '90%', height: 20 }} />

        {/* Priority and labels */}
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <Skeleton.Button active size="small" style={{ width: 60, height: 24 }} />
          <Skeleton.Button active size="small" style={{ width: 70, height: 24 }} />
        </div>

        {/* Due date and assignee */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
          <Skeleton.Input active style={{ width: 80, height: 16 }} />
          <Skeleton.Avatar active size="small" />
        </div>
      </Space>
    </Card>
  );
}
