import { useState, useEffect } from 'react'
import type { RefObject } from 'react'
import { Input, Select, Space, Button, Card, Checkbox } from 'antd'
import { SearchOutlined, ClearOutlined, FilterOutlined } from '@ant-design/icons'
import type { Priority } from '../../types/api'

const { Option } = Select

export interface BoardFiltersProps {
  searchInputRef?: RefObject<HTMLInputElement | null>
  searchTerm?: string
  statusId?: string
  typeId?: string
  assigneeId?: string
  priority?: Priority
  showArchived?: boolean
  onFilterChange: (filters: BoardFiltersState) => void
  statuses?: Array<{ id: string; name: string }>
  taskTypes?: Array<{ id: string; name: string }>
  members?: Array<{ userId: string; user: { firstName: string; lastName: string } }>
}

export interface BoardFiltersState {
  searchTerm?: string
  statusId?: string
  typeId?: string
  assigneeId?: string
  priority?: Priority
  showArchived?: boolean
}

const priorityOptions = [
  { value: 0, label: 'Low' },
  { value: 1, label: 'Medium' },
  { value: 2, label: 'High' },
  { value: 3, label: 'Critical' },
]

export function BoardFilters({
  searchInputRef,
  searchTerm: initialSearchTerm,
  statusId: initialStatusId,
  typeId: initialTypeId,
  assigneeId: initialAssigneeId,
  priority: initialPriority,
  showArchived: initialShowArchived,
  onFilterChange,
  statuses = [],
  taskTypes = [],
  members = [],
}: BoardFiltersProps) {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm || '')
  const [statusId, setStatusId] = useState<string | undefined>(initialStatusId)
  const [typeId, setTypeId] = useState<string | undefined>(initialTypeId)
  const [assigneeId, setAssigneeId] = useState<string | undefined>(initialAssigneeId)
  const [priority, setPriority] = useState<Priority | undefined>(initialPriority)
  const [showArchived, setShowArchived] = useState(initialShowArchived || false)

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange({
        searchTerm: searchTerm || undefined,
        statusId,
        typeId,
        assigneeId,
        priority,
        showArchived,
      })
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Immediately update filters (no debounce for dropdowns)
  useEffect(() => {
    onFilterChange({
      searchTerm: searchTerm || undefined,
      statusId,
      typeId,
      assigneeId,
      priority,
      showArchived,
    })
  }, [statusId, typeId, assigneeId, priority, showArchived])

  const handleClearFilters = () => {
    setSearchTerm('')
    setStatusId(undefined)
    setTypeId(undefined)
    setAssigneeId(undefined)
    setPriority(undefined)
    setShowArchived(false)
  }

  const hasActiveFilters = !!(
    searchTerm ||
    statusId ||
    typeId ||
    assigneeId ||
    priority !== undefined ||
    showArchived
  )

  return (
    <Card
      size="small"
      style={{ marginBottom: 16 }}
      bodyStyle={{ padding: '12px 16px' }}
    >
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        <Space wrap size="small" style={{ width: '100%' }}>
          <Input
            ref={searchInputRef as any}
            placeholder="Search tasks..."
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: 250 }}
            allowClear
          />

          <Select
            placeholder="Status"
            value={statusId}
            onChange={setStatusId}
            style={{ width: 150 }}
            allowClear
          >
            {statuses.map((status) => (
              <Option key={status.id} value={status.id}>
                {status.name}
              </Option>
            ))}
          </Select>

          <Select
            placeholder="Type"
            value={typeId}
            onChange={setTypeId}
            style={{ width: 150 }}
            allowClear
          >
            {taskTypes.map((type) => (
              <Option key={type.id} value={type.id}>
                {type.name}
              </Option>
            ))}
          </Select>

          <Select
            placeholder="Priority"
            value={priority}
            onChange={setPriority}
            style={{ width: 130 }}
            allowClear
          >
            {priorityOptions.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>

          <Select
            placeholder="Assignee"
            value={assigneeId}
            onChange={setAssigneeId}
            style={{ width: 180 }}
            allowClear
            showSearch
            filterOption={(input, option) =>
              (option?.label?.toString() || '')
                .toLowerCase()
                .includes(input.toLowerCase())
            }
          >
            {members.map((member) => (
              <Option key={member.userId} value={member.userId}>
                {member.user.firstName} {member.user.lastName}
              </Option>
            ))}
          </Select>

          <Checkbox
            checked={showArchived}
            onChange={(e) => setShowArchived(e.target.checked)}
          >
            Show Archived
          </Checkbox>

          {hasActiveFilters && (
            <Button
              type="text"
              icon={<ClearOutlined />}
              onClick={handleClearFilters}
            >
              Clear Filters
            </Button>
          )}
        </Space>

        {hasActiveFilters && (
          <Space size={4} style={{ fontSize: 12, color: '#666' }}>
            <FilterOutlined />
            <span>
              {[
                searchTerm && `Search: "${searchTerm}"`,
                statusId && `Status: ${statuses.find((s) => s.id === statusId)?.name}`,
                typeId && `Type: ${taskTypes.find((t) => t.id === typeId)?.name}`,
                assigneeId &&
                  `Assignee: ${
                    members.find((m) => m.userId === assigneeId)?.user.firstName
                  } ${members.find((m) => m.userId === assigneeId)?.user.lastName}`,
                priority !== undefined &&
                  `Priority: ${priorityOptions.find((p) => p.value === priority)?.label}`,
                showArchived && 'Archived',
              ]
                .filter(Boolean)
                .join(' • ')}
            </span>
          </Space>
        )}
      </Space>
    </Card>
  )
}
