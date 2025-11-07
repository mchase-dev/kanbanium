import { useState, useEffect } from 'react'
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Space,
  Typography,
  Divider,
  Tag,
  Tabs,
  Skeleton,
} from 'antd'
import {
  UserOutlined,
  CalendarOutlined,
  FlagOutlined,
  DeleteOutlined,
  SaveOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { useTask, useUpdateTask, useDeleteTask } from '../../hooks/useTasks'
import { useStatuses, useTaskTypes } from '../../hooks/useReferenceData'
import { UserAvatar } from '../common/UserAvatar'
import { useBoardMembers } from '../../hooks/useBoards'
import { SubTaskList } from './SubTaskList'
import { LabelPicker } from '../label/LabelPicker'
import { TaskComments } from './TaskComments'
import { TaskAttachments } from './TaskAttachments'
import { TaskActivity } from './TaskActivity'
import { TaskWatchers } from './TaskWatchers'
import type { UpdateTaskRequest, Priority } from '../../types/api'

const { TextArea } = Input
const { Text } = Typography

interface TaskModalProps {
  taskId: string | null
  open: boolean
  onClose: () => void
}

const priorityOptions = [
  { value: 0, label: 'Low', color: 'default' },
  { value: 1, label: 'Medium', color: 'blue' },
  { value: 2, label: 'High', color: 'orange' },
  { value: 3, label: 'Critical', color: 'red' },
]

export function TaskModal({ taskId, open, onClose }: TaskModalProps) {
  const [form] = Form.useForm()
  const [isEditing, setIsEditing] = useState(false)

  const { data: task, isLoading } = useTask(taskId!)
  const updateTask = useUpdateTask()
  const deleteTask = useDeleteTask()

  // Load reference data
  const { data: statuses } = useStatuses()
  const { data: taskTypes } = useTaskTypes()
  const { data: members } = useBoardMembers(task?.boardId || '')

  useEffect(() => {
    if (task && open) {
      form.setFieldsValue({
        title: task.title,
        description: task.description,
        statusId: task.statusId,
        typeId: task.typeId,
        priority: task.priority,
        assigneeId: task.assigneeId,
        sprintId: task.sprintId,
        dueDate: task.dueDate ? dayjs(task.dueDate) : null,
      })
      setIsEditing(false)
    }
  }, [task, open, form])

  const handleUpdate = async (values: any) => {
    if (!taskId) return

    const updateData: UpdateTaskRequest = {
      title: values.title,
      description: values.description,
      statusId: values.statusId,
      typeId: values.typeId,
      priority: values.priority as Priority,
      assigneeId: values.assigneeId,
      sprintId: values.sprintId,
      dueDate: values.dueDate ? values.dueDate.toISOString() : undefined,
    }

    try {
      await updateTask.mutateAsync({ id: taskId, data: updateData })
      setIsEditing(false)
    } catch (error) {
      // Error handled by mutation
    }
  }

  const handleDelete = async () => {
    if (!taskId) return

    Modal.confirm({
      title: 'Delete Task',
      content: 'Are you sure you want to delete this task? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        await deleteTask.mutateAsync(taskId)
        onClose()
      },
    })
  }

  const handleCancel = () => {
    if (task) {
      form.setFieldsValue({
        title: task.title,
        description: task.description,
        statusId: task.statusId,
        typeId: task.typeId,
        priority: task.priority,
        assigneeId: task.assigneeId,
        sprintId: task.sprintId,
        dueDate: task.dueDate ? dayjs(task.dueDate) : null,
      })
    }
    setIsEditing(false)
  }

  const tabItems = [
    {
      key: 'details',
      label: 'Details',
      children: (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdate}
          autoComplete="off"
          disabled={!isEditing}
        >
          <Form.Item
            label="Title"
            name="title"
            rules={[
              { required: true, message: 'Please enter a title' },
              { max: 200, message: 'Title must be less than 200 characters' },
            ]}
          >
            <Input placeholder="Task title" size="large" />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[
              { max: 2000, message: 'Description must be less than 2000 characters' },
            ]}
          >
            <TextArea rows={6} placeholder="Add a description..." />
          </Form.Item>

          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Form.Item
              label="Status"
              name="statusId"
              rules={[{ required: true, message: 'Please select a status' }]}
            >
              <Select placeholder="Select status">
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
            </Form.Item>

            <Form.Item
              label="Type"
              name="typeId"
              rules={[{ required: true, message: 'Please select a type' }]}
            >
              <Select placeholder="Select type">
                {taskTypes?.map((type) => (
                  <Select.Option key={type.id} value={type.id}>
                    <Tag color={type.color}>{type.name}</Tag>
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="Priority" name="priority">
              <Select placeholder="Select priority">
                {priorityOptions.map((opt) => (
                  <Select.Option key={opt.value} value={opt.value}>
                    <Tag color={opt.color} style={{ marginRight: 8 }}>
                      <FlagOutlined />
                    </Tag>
                    {opt.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="Assignee" name="assigneeId">
              <Select placeholder="Select assignee" allowClear>
                {members?.map((member) => (
                  <Select.Option key={member.userId} value={member.userId}>
                    <Space>
                      <UserAvatar user={member.user} size="small" />
                      {member.user.firstName} {member.user.lastName}
                    </Space>
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="Due Date" name="dueDate">
              <DatePicker
                style={{ width: '100%' }}
                format="YYYY-MM-DD"
                suffixIcon={<CalendarOutlined />}
              />
            </Form.Item>
          </Space>

          {isEditing && (
            <Space style={{ marginTop: 16 }}>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={updateTask.isPending}
              >
                Save Changes
              </Button>
              <Button onClick={handleCancel}>Cancel</Button>
            </Space>
          )}
        </Form>
      ),
    },
    {
      key: 'subtasks',
      label: `Subtasks (${task?.subTasks?.length || 0})`,
      children: (
        <div style={{ padding: '16px 0' }}>
          {task && <SubTaskList taskId={task.id} subTasks={task.subTasks || []} />}
        </div>
      ),
    },
    {
      key: 'labels',
      label: `Labels (${task?.labels?.length || 0})`,
      children: (
        <div style={{ padding: '16px 0' }}>
          {task && (
            <LabelPicker
              boardId={task.boardId}
              taskId={task.id}
              taskLabels={task.labels || []}
            />
          )}
        </div>
      ),
    },
    {
      key: 'activity',
      label: 'Activity',
      children: task && <TaskActivity taskId={task.id} />,
    },
    {
      key: 'comments',
      label: `Comments (${task?.commentCount || 0})`,
      children: (
        <div style={{ padding: '16px 0' }}>
          {task && <TaskComments taskId={task.id} />}
        </div>
      ),
    },
    {
      key: 'attachments',
      label: `Attachments (${task?.attachmentCount || 0})`,
      children: (
        <div style={{ padding: '16px 0' }}>
          {task && <TaskAttachments taskId={task.id} />}
        </div>
      ),
    },
    {
      key: 'watchers',
      label: `Watchers (${task?.watchers?.length || 0})`,
      children: task && <TaskWatchers taskId={task.id} watchers={task.watchers || []} />,
    },
  ]

  return (
    <Modal
      title={
        <Space direction="vertical" style={{ width: '100%' }} size={0}>
          <Space>
            {task?.type && (
              <Tag color={task.type.color}>{task.type.name}</Tag>
            )}
            <Text type="secondary" style={{ fontSize: 14 }}>
              Task
            </Text>
          </Space>
        </Space>
      }
      open={open}
      onCancel={onClose}
      width={800}
      footer={
        <Space>
          <Button danger icon={<DeleteOutlined />} onClick={handleDelete}>
            Delete
          </Button>
          <Button onClick={onClose}>Close</Button>
          {!isEditing && (
            <Button type="primary" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
          )}
        </Space>
      }
      destroyOnClose
    >
      {isLoading ? (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          {/* Task metadata skeleton */}
          <Space wrap>
            <Skeleton.Button active size="small" style={{ width: 80 }} />
            <Skeleton.Avatar active size="small" />
            <Skeleton.Input active size="small" style={{ width: 120 }} />
          </Space>

          <Divider style={{ margin: '8px 0' }} />

          {/* Title skeleton */}
          <Skeleton.Input active block style={{ height: 32 }} />

          {/* Description skeleton */}
          <Skeleton active paragraph={{ rows: 4 }} title={false} />

          {/* Tabs skeleton */}
          <Skeleton active paragraph={{ rows: 2 }} />
        </Space>
      ) : task ? (
        <>
          {/* Task Metadata */}
          <Space
            style={{
              width: '100%',
              marginBottom: 16,
              paddingBottom: 16,
              borderBottom: '1px solid #f0f0f0',
            }}
            wrap
          >
            {task.priority !== undefined && task.priority > 0 && (
              <Tag
                color={priorityOptions[task.priority].color}
                icon={<FlagOutlined />}
              >
                {priorityOptions[task.priority].label}
              </Tag>
            )}

            {task.assignee && (
              <Space size={4}>
                <UserOutlined style={{ color: '#999' }} />
                <Text type="secondary">
                  {task.assignee.firstName} {task.assignee.lastName}
                </Text>
              </Space>
            )}

            {task.dueDate && (
              <Space size={4}>
                <CalendarOutlined style={{ color: '#999' }} />
                <Text type="secondary">
                  Due {dayjs(task.dueDate).format('MMM D, YYYY')}
                </Text>
              </Space>
            )}
          </Space>

          <Divider style={{ margin: '0 0 16px 0' }} />

          {/* Tabs */}
          <Tabs items={tabItems} />
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Text type="secondary">Task not found</Text>
        </div>
      )}
    </Modal>
  )
}
