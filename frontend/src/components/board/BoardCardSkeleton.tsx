import { Card, Skeleton, Space } from 'antd';

/**
 * Skeleton loader for board cards on the dashboard
 */
export default function BoardCardSkeleton() {
  return (
    <Card>
      <Space direction="vertical" style={{ width: '100%' }} size="small">
        {/* Board title */}
        <Skeleton.Input active style={{ width: '70%', height: 24 }} />

        {/* Board description */}
        <Skeleton active paragraph={{ rows: 2, width: ['100%', '80%'] }} title={false} />

        {/* Stats section */}
        <div style={{ marginTop: 16, display: 'flex', gap: 16 }}>
          <Skeleton.Input active style={{ width: 80, height: 20 }} />
          <Skeleton.Input active style={{ width: 80, height: 20 }} />
        </div>
      </Space>
    </Card>
  );
}
