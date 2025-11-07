import { useEffect } from 'react'
import { Modal, Form, Input, Select, DatePicker, Space, Tag } from 'antd'
import {
  CalendarOutlined,
  FlagOutlined,
} from '@ant-design/icons'
import { useCreateTask } from '../../hooks/useTasks'
import { useStatuses, useTaskTypes } from '../../hooks/useReferenceData'
import { useBoardMembers } from '../../hooks/useBoards'
import { UserAvatar } from '../common/UserAvatar'
import type { CreateTaskRequest, Priority } from '../../types/api'

const { TextArea } = Input

interface CreateTaskModalProps {
  open: boolean
  onClose: () => void
  boardId: string
  columnId: string
}

const priorityOptions = [
  { value: 0, label: 'Low', color: 'default' },
  { value: 1, label: 'Medium', color: 'blue' },
  { value: 2, label: 'High', color: 'orange' },
  { value: 3, label: 'Critical', color: 'red' },
]

export function CreateTaskModal({
  open,
  onClose,
  boardId,
  columnId,
}: CreateTaskModalProps) {
  const [form] = Form.useForm()
  const createTask = useCreateTask()
  const { data: statuses, isLoading: statusesLoading } = useStatuses()
  const { data: taskTypes, isLoading: taskTypesLoading } = useTaskTypes()
  const { data: members, isLoading: membersLoading } = useBoardMembers(boardId)

  // Set default values when modal opens
  useEffect(() => {
    if (open && statuses && taskTypes) {
      // Find default status (first "To Do" status)
      const defaultStatus = statuses.find((s) => s.category === 0) || statuses[0]
      // Find default task type (first one or "Task" type)
      const defaultType = taskTypes.find((t) => t.name === 'Task') || taskTypes[0]

      form.setFieldsValue({
        priority: 0, // Low priority by default
        statusId: defaultStatus?.id,
        typeId: defaultType?.id,
      })
    }
  }, [open, statuses, taskTypes, form])

  const handleSubmit = async (values: any) => {
    const createData: CreateTaskRequest = {
      boardId,
      columnId,
      title: values.title,
      description: values.description,
      statusId: values.statusId,
      typeId: values.typeId,
      priority: values.priority as Priority,
      assigneeId: values.assigneeId,
      dueDate: values.dueDate ? values.dueDate.toISOString() : undefined,
    }

    try {
      await createTask.mutateAsync(createData)
      form.resetFields()
      onClose()
    } catch (error) {
      // Error handled by mutation
    }
  }

  const handleCancel = () => {
    form.resetFields()
    onClose()
  }

  const isLoading = statusesLoading || taskTypesLoading || membersLoading

  return (
    <Modal
      title="Create Task"
      open={open}
      onCancel={handleCancel}
      onOk={() => form.submit()}
      okText="Create"
      cancelText="Cancel"
      confirmLoading={createTask.isPending}
      width={600}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
        disabled={isLoading}
      >
        <Form.Item
          label="Title"
          name="title"
          rules={[
            { required: true, message: 'Please enter a title' },
            { max: 200, message: 'Title must be less than 200 characters' },
          ]}
        >
          <Input placeholder="Enter task title" size="large" autoFocus />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          rules={[
            { max: 2000, message: 'Description must be less than 2000 characters' },
          ]}
        >
          <TextArea rows={4} placeholder="Add a description..." />
        </Form.Item>

        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Form.Item
            label="Status"
            name="statusId"
            rules={[{ required: true, message: 'Please select a status' }]}
          >
            <Select
              placeholder="Select status"
              loading={statusesLoading}
              options={statuses?.map((status) => ({
                value: status.id,
                label: (
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
              }))}
            />
          </Form.Item>

          <Form.Item
            label="Type"
            name="typeId"
            rules={[{ required: true, message: 'Please select a type' }]}
          >
            <Select
              placeholder="Select type"
              loading={taskTypesLoading}
              options={taskTypes?.map((type) => ({
                value: type.id,
                label: (
                  <Space>
                    <Tag color={type.color}>{type.name}</Tag>
                  </Space>
                ),
              }))}
            />
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
            <Select
              placeholder="Select assignee"
              allowClear
              loading={membersLoading}
              options={members?.map((member) => ({
                value: member.userId,
                label: (
                  <Space>
                    <UserAvatar user={member.user} size="small" />
                    {member.user.firstName} {member.user.lastName}
                  </Space>
                ),
              }))}
            />
          </Form.Item>

          <Form.Item label="Due Date" name="dueDate">
            <DatePicker
              style={{ width: '100%' }}
              format="YYYY-MM-DD"
              suffixIcon={<CalendarOutlined />}
            />
          </Form.Item>
        </Space>
      </Form>
    </Modal>
  )
}
