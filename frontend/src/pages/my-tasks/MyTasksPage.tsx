import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Table,
  Tag,
  Typography,
  Space,
  Select,
  Button,
  Empty,
  Spin,
  Switch,
} from 'antd'
import {
  FlagOutlined,
  CalendarOutlined,
  FolderOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons'
import { DashboardLayout } from '../../layouts/DashboardLayout'
import { useMyTasks } from '../../hooks/useTasks'
import { useStatuses } from '../../hooks/useReferenceData'
import type { MyTaskDto, Priority } from '../../types/api'
import type { ColumnsType } from 'antd/es/table'

const { Title, Text } = Typography

const priorityOptions = [
  { value: 0, label: 'Low', color: 'default' },
  { value: 1, label: 'Medium', color: 'blue' },
  { value: 2, label: 'High', color: 'orange' },
  { value: 3, label: 'Critical', color: 'red' },
]

const sortOptions = [
  { value: 'DueDate', label: 'Due Date' },
  { value: 'Priority', label: 'Priority' },
  { value: 'CreatedAt', label: 'Created Date' },
]

export function MyTasksPage() {
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState<string | undefined>()
  const [priorityFilter, setPriorityFilter] = useState<number | undefined>()
  const [overdueOnly, setOverdueOnly] = useState(false)
  const [sortBy, setSortBy] = useState('DueDate')

  const { data: statuses } = useStatuses()
  const { data: tasks, isLoading } = useMyTasks({
    statusId: statusFilter,
    priority: priorityFilter,
    isOverdue: overdueOnly || undefined,
    sortBy,
  })

  const columns: ColumnsType<MyTaskDto> = [
    {
      title: 'Task',
      dataIndex: 'title',
      key: 'title',
      render: (title: string, record: MyTaskDto) => (
        <Space direction="vertical" size={0}>
          <Text strong style={{ cursor: 'pointer' }} onClick={() => navigate(`/boards/${record.boardId}`)}>
            {title}
          </Text>
          <Space size={4}>
            <FolderOutlined style={{ fontSize: 12, color: '#999' }} />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.boardName}
            </Text>
          </Space>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (status) => (
        <Space>
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: status.color,
            }}
          />
          {status.name}
        </Space>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type) => <Tag color={type.color}>{type.name}</Tag>,
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      width: 120,
      render: (priority: Priority) => {
        if (priority === 0) return null
        const option = priorityOptions[priority]
        return (
          <Tag color={option.color} icon={<FlagOutlined />}>
            {option.label}
          </Tag>
        )
      },
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: 150,
      render: (dueDate: string | null, record: MyTaskDto) => {
        if (!dueDate) return <Text type="secondary">-</Text>
        const isOverdue = record.isOverdue
        return (
          <Space size={4}>
            <CalendarOutlined style={{ color: isOverdue ? '#ff4d4f' : '#999' }} />
            <Text type={isOverdue ? 'danger' : 'secondary'} style={{ fontSize: 13 }}>
              {new Date(dueDate).toLocaleDateString()}
            </Text>
          </Space>
        )
      },
    },
    {
      title: 'Subtasks',
      key: 'subtasks',
      width: 100,
      render: (_, record: MyTaskDto) => {
        if (record.subTaskCount === 0) return <Text type="secondary">-</Text>
        return (
          <Text type="secondary" style={{ fontSize: 13 }}>
            {record.completedSubTaskCount}/{record.subTaskCount}
          </Text>
        )
      },
    },
    {
      title: 'Labels',
      dataIndex: 'labels',
      key: 'labels',
      render: (labels) =>
        labels.length > 0 ? (
          <Space size={4} wrap>
            {labels.map((tl: any) => (
              <Tag key={tl.labelId} color={tl.label.color} style={{ margin: 0 }}>
                {tl.label.name}
              </Tag>
            ))}
          </Space>
        ) : (
          <Text type="secondary">-</Text>
        ),
    },
  ]

  return (
    <DashboardLayout>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>
          <ClockCircleOutlined style={{ marginRight: 12 }} />
          My Tasks
        </Title>
        <Text type="secondary">All tasks assigned to you across all boards</Text>
      </div>

      {/* Filters */}
      <Space style={{ marginBottom: 16 }} wrap>
        <Select
          placeholder="Filter by status"
          style={{ width: 200 }}
          allowClear
          value={statusFilter}
          onChange={setStatusFilter}
        >
          {statuses?.map((status) => (
            <Select.Option key={status.id} value={status.id}>
              <Space>
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: status.color,
                  }}
                />
                {status.name}
              </Space>
            </Select.Option>
          ))}
        </Select>

        <Select
          placeholder="Filter by priority"
          style={{ width: 200 }}
          allowClear
          value={priorityFilter}
          onChange={setPriorityFilter}
        >
          {priorityOptions.map((opt) => (
            <Select.Option key={opt.value} value={opt.value}>
              <Tag color={opt.color} style={{ marginRight: 8 }}>
                <FlagOutlined />
              </Tag>
              {opt.label}
            </Select.Option>
          ))}
        </Select>

        <Select
          value={sortBy}
          style={{ width: 200 }}
          onChange={setSortBy}
        >
          {sortOptions.map((opt) => (
            <Select.Option key={opt.value} value={opt.value}>
              Sort by: {opt.label}
            </Select.Option>
          ))}
        </Select>

        <Space>
          <Text>Overdue only:</Text>
          <Switch checked={overdueOnly} onChange={setOverdueOnly} />
        </Space>

        {(statusFilter || priorityFilter !== undefined || overdueOnly) && (
          <Button
            onClick={() => {
              setStatusFilter(undefined)
              setPriorityFilter(undefined)
              setOverdueOnly(false)
            }}
          >
            Clear Filters
          </Button>
        )}
      </Space>

      {/* Tasks Table */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <Spin size="large" />
        </div>
      ) : tasks && tasks.length > 0 ? (
        <Table
          dataSource={tasks}
          columns={columns}
          rowKey="id"
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} tasks`,
          }}
          onRow={(record) => ({
            onClick: () => navigate(`/boards/${record.boardId}?taskId=${record.id}`),
            style: { cursor: 'pointer' },
          })}
        />
      ) : (
        <Empty
          description={
            statusFilter || priorityFilter !== undefined || overdueOnly
              ? 'No tasks match the selected filters'
              : 'No tasks assigned to you'
          }
          style={{ padding: 60 }}
        />
      )}
    </DashboardLayout>
  )
}
