import { useState, useMemo, useEffect, useRef } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { Empty, Button, Card, Space } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import TaskCardSkeleton from '../../components/task/TaskCardSkeleton'
import GlobalKeyboardShortcuts from '../../components/common/GlobalKeyboardShortcuts'
import { useQueryClient } from '@tanstack/react-query'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { DashboardLayout } from '../../layouts/DashboardLayout'
import { BoardHeader } from '../../components/board/BoardHeader'
import { BoardColumn } from '../../components/board/BoardColumn'
import { BoardFilters, type BoardFiltersState } from '../../components/board/BoardFilters'
import { AddColumnModal } from '../../components/board/AddColumnModal'
import { MembersModal } from '../../components/board/MembersModal'
import { LabelsModal } from '../../components/label/LabelsModal'
import { TaskCard } from '../../components/task/TaskCard'
import { TaskModal } from '../../components/task/TaskModal'
import { CreateTaskModal } from '../../components/task/CreateTaskModal'
import { useBoard } from '../../hooks/useBoards'
import { useSearchTasks, useMoveTask, taskKeys } from '../../hooks/useTasks'
import { useStatuses, useTaskTypes } from '../../hooks/useReferenceData'
import { useAuth } from '../../contexts/AuthContext'
import { signalRService } from '../../lib/signalr-service'
import type { TaskListDto, BoardDto, Priority } from '../../types/api'

export function BoardPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const searchInputRef = useRef<HTMLInputElement>(null)

  // State
  const [activeTask, setActiveTask] = useState<TaskListDto | null>(null)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [taskModalOpen, setTaskModalOpen] = useState(false)
  const [createTaskModalOpen, setCreateTaskModalOpen] = useState(false)
  const [selectedColumnId, setSelectedColumnId] = useState<string | null>(null)
  const [addColumnModalOpen, setAddColumnModalOpen] = useState(false)
  const [membersModalOpen, setMembersModalOpen] = useState(false)
  const [labelsModalOpen, setLabelsModalOpen] = useState(false)

  // Filters from URL params
  const filters: BoardFiltersState = {
    searchTerm: searchParams.get('search') || undefined,
    statusId: searchParams.get('status') || undefined,
    typeId: searchParams.get('type') || undefined,
    assigneeId: searchParams.get('assignee') || undefined,
    priority: searchParams.get('priority') ? Number(searchParams.get('priority')) as Priority : undefined,
    showArchived: searchParams.get('archived') === 'true',
  }

  // Fetch data
  const { data: board, isLoading: isBoardLoading } = useBoard(id!)
  const { data: statuses = [] } = useStatuses()
  const { data: taskTypes = [] } = useTaskTypes()

  // Use search instead of getTasksByBoard to support filtering
  const { data: tasks = [], isLoading: isTasksLoading } = useSearchTasks({
    boardId: id!,
    searchTerm: filters.searchTerm,
    statusId: filters.statusId,
    typeId: filters.typeId,
    assigneeId: filters.assigneeId,
    priority: filters.priority,
    isArchived: filters.showArchived,
  })

  const moveTask = useMoveTask()

  // Cast board to BoardDto for columns access
  const boardDto = board as BoardDto | undefined

  // Handle filter changes
  const handleFilterChange = (newFilters: BoardFiltersState) => {
    const params = new URLSearchParams()
    if (newFilters.searchTerm) params.set('search', newFilters.searchTerm)
    if (newFilters.statusId) params.set('status', newFilters.statusId)
    if (newFilters.typeId) params.set('type', newFilters.typeId)
    if (newFilters.assigneeId) params.set('assignee', newFilters.assigneeId)
    if (newFilters.priority !== undefined) params.set('priority', newFilters.priority.toString())
    if (newFilters.showArchived) params.set('archived', 'true')
    setSearchParams(params)
  }

  // Set up SignalR connection and event listeners
  useEffect(() => {
    if (!id || !user) return

    const accessToken = localStorage.getItem('accessToken')
    if (!accessToken) return

    let isSubscribed = true

    // Connect to SignalR
    const setupSignalR = async () => {
      try {
        await signalRService.connect(accessToken)

        if (!isSubscribed) return

        await signalRService.joinBoard(id)

        // Task event handlers
        const handleTaskMoved = (data: { boardId: string; taskId: string }) => {
          console.log('TaskMoved event received:', data)
          queryClient.invalidateQueries({ queryKey: taskKeys.search })
        }

        const handleTaskUpdated = (data: { boardId: string; taskId: string }) => {
          console.log('TaskUpdated event received:', data)
          queryClient.invalidateQueries({ queryKey: taskKeys.search })
          queryClient.invalidateQueries({ queryKey: taskKeys.detail(data.taskId) })
        }

        const handleTaskCreated = (data: { boardId: string; taskId: string }) => {
          console.log('TaskCreated event received:', data)
          queryClient.invalidateQueries({ queryKey: taskKeys.search })
        }

        const handleTaskDeleted = (data: { boardId: string; taskId: string }) => {
          console.log('TaskDeleted event received:', data)
          queryClient.invalidateQueries({ queryKey: taskKeys.search })
        }

        // Register event handlers
        signalRService.on('TaskMoved', handleTaskMoved)
        signalRService.on('TaskUpdated', handleTaskUpdated)
        signalRService.on('TaskCreated', handleTaskCreated)
        signalRService.on('TaskDeleted', handleTaskDeleted)

        console.log(`SignalR setup complete for board ${id}`)
      } catch (error) {
        console.error('SignalR setup failed:', error)
      }
    }

    setupSignalR()

    // Cleanup on unmount
    return () => {
      isSubscribed = false
      if (id) {
        signalRService.leaveBoard(id).catch(console.error)
      }
      // Don't disconnect here - other components might be using it
    }
  }, [id, user, queryClient])

  // Check for taskId in URL params and open task modal
  useEffect(() => {
    const taskId = searchParams.get('taskId')
    if (taskId && !taskModalOpen) {
      setSelectedTaskId(taskId)
      setTaskModalOpen(true)
      // Remove taskId from URL after opening modal
      const newParams = new URLSearchParams(searchParams)
      newParams.delete('taskId')
      setSearchParams(newParams, { replace: true })
    }
  }, [searchParams, taskModalOpen, setSearchParams])

  // Set up drag sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Group tasks by column
  const tasksByColumn = useMemo(() => {
    const grouped: Record<string, TaskListDto[]> = {}

    if (boardDto?.columns) {
      boardDto.columns.forEach((column) => {
        grouped[column.id] = []
      })
    }

    tasks.forEach((task) => {
      if (task.columnId && grouped[task.columnId]) {
        grouped[task.columnId].push(task)
      }
    })

    // Sort tasks by positionIndex within each column
    Object.keys(grouped).forEach((columnId) => {
      grouped[columnId].sort((a, b) => a.positionIndex - b.positionIndex)
    })

    return grouped
  }, [boardDto?.columns, tasks])

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const task = tasks.find((t) => t.id === active.id)
    if (task) {
      setActiveTask(task)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const taskId = active.id as string

    // Find the task being moved
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return

    // Determine target column and position
    let targetColumnId: string
    let newPositionIndex: number

    // Check if we're dropping over a task or a column
    const overTask = tasks.find((t) => t.id === over.id)

    if (overTask) {
      // Dropping over another task
      targetColumnId = overTask.columnId
      const targetColumnTasks = tasksByColumn[targetColumnId] || []

      // Find the position of the task we're dropping over
      const overIndex = targetColumnTasks.findIndex((t) => t.id === over.id)

      if (task.columnId === targetColumnId) {
        // Reordering within the same column
        const oldIndex = targetColumnTasks.findIndex((t) => t.id === taskId)

        if (oldIndex === overIndex) {
          // Same position, no change needed
          return
        }

        // Calculate new position based on drag direction
        newPositionIndex = oldIndex < overIndex ? overIndex : overIndex
      } else {
        // Moving to a different column
        newPositionIndex = overIndex
      }
    } else {
      // Dropping over a column (empty space or column droppable)
      targetColumnId = over.id as string

      // Verify it's actually a column ID
      const isValidColumn = boardDto?.columns.some((col) => col.id === targetColumnId)
      if (!isValidColumn) {
        console.error('Invalid drop target:', over.id)
        return
      }

      // Add to the end of the column
      const targetColumnTasks = tasksByColumn[targetColumnId] || []
      newPositionIndex = targetColumnTasks.length
    }

    // If same column and same position, do nothing
    if (task.columnId === targetColumnId && task.positionIndex === newPositionIndex) {
      return
    }

    // Move the task
    moveTask.mutate({
      id: taskId,
      data: {
        columnId: targetColumnId,
        positionIndex: newPositionIndex,
      },
    })
  }

  const handleTaskClick = (task: TaskListDto) => {
    setSelectedTaskId(task.id)
    setTaskModalOpen(true)
  }

  const handleCloseTaskModal = () => {
    setTaskModalOpen(false)
    setSelectedTaskId(null)
  }

  const handleAddTask = (columnId: string) => {
    setSelectedColumnId(columnId)
    setCreateTaskModalOpen(true)
  }

  const handleCloseCreateTaskModal = () => {
    setCreateTaskModalOpen(false)
    setSelectedColumnId(null)
  }

  // Keyboard shortcut handlers
  const handleCreateTaskShortcut = () => {
    // Open create task modal with first column if available
    if (boardDto?.columns && boardDto.columns.length > 0) {
      setSelectedColumnId(boardDto.columns[0].id)
      setCreateTaskModalOpen(true)
    }
  }

  const handleFocusSearchShortcut = () => {
    searchInputRef.current?.focus()
  }

  if (!id) {
    return (
      <DashboardLayout>
        <Empty description="Board not found" />
      </DashboardLayout>
    )
  }

  if (isBoardLoading || isTasksLoading) {
    return (
      <DashboardLayout>
        <div style={{ padding: 24 }}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* Header skeleton */}
            <Card>
              <div style={{ display: 'flex', gap: 16 }}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} style={{ flex: 1 }}>
                    <TaskCardSkeleton />
                  </div>
                ))}
              </div>
            </Card>
          </Space>
        </div>
      </DashboardLayout>
    )
  }

  if (!board) {
    return (
      <DashboardLayout>
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <Empty description="Board not found" />
          <Button type="primary" onClick={() => navigate('/dashboard')} style={{ marginTop: 16 }}>
            Back to Dashboard
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <GlobalKeyboardShortcuts
        onCreateTask={handleCreateTaskShortcut}
        onFocusSearch={handleFocusSearchShortcut}
      />
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Back Button */}
        <div style={{ padding: '16px 24px' }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/dashboard')}
          >
            Back to Dashboard
          </Button>
        </div>

        {/* Board Header */}
        <BoardHeader
          board={board}
          onAddColumn={() => setAddColumnModalOpen(true)}
          onManageMembers={() => setMembersModalOpen(true)}
          onManageLabels={() => setLabelsModalOpen(true)}
          onSettings={() => console.log('Settings')}
          onArchive={() => console.log('Archive')}
          onDelete={() => console.log('Delete')}
        />

        {/* Filters */}
        <div style={{ padding: '0 24px' }}>
          <BoardFilters
            searchInputRef={searchInputRef}
            searchTerm={filters.searchTerm}
            statusId={filters.statusId}
            typeId={filters.typeId}
            assigneeId={filters.assigneeId}
            priority={filters.priority}
            showArchived={filters.showArchived}
            onFilterChange={handleFilterChange}
            statuses={statuses}
            taskTypes={taskTypes}
            members={boardDto?.members || []}
          />
        </div>

        {/* Board Content */}
        <div
          style={{
            flex: 1,
            overflowX: 'auto',
            overflowY: 'hidden',
            padding: 24,
          }}
        >
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div style={{ display: 'flex', gap: 16, height: '100%' }}>
              {boardDto?.columns && boardDto.columns.length > 0 ? (
                boardDto.columns.map((column) => (
                  <BoardColumn
                    key={column.id}
                    column={column}
                    tasks={tasksByColumn[column.id] || []}
                    onAddTask={() => handleAddTask(column.id)}
                    onTaskClick={handleTaskClick}
                  />
                ))
              ) : (
                <Empty
                  description="No columns yet. Add a column to get started."
                  style={{ margin: 'auto' }}
                />
              )}
            </div>

            <DragOverlay>
              {activeTask ? <TaskCard task={activeTask} /> : null}
            </DragOverlay>
          </DndContext>
        </div>
      </div>

      {/* Task Modal */}
      <TaskModal
        taskId={selectedTaskId}
        open={taskModalOpen}
        onClose={handleCloseTaskModal}
      />

      {/* Create Task Modal */}
      {selectedColumnId && (
        <CreateTaskModal
          open={createTaskModalOpen}
          onClose={handleCloseCreateTaskModal}
          boardId={id}
          columnId={selectedColumnId}
        />
      )}

      {/* Add Column Modal */}
      <AddColumnModal
        open={addColumnModalOpen}
        onClose={() => setAddColumnModalOpen(false)}
        boardId={id}
      />

      {/* Members Modal */}
      <MembersModal
        open={membersModalOpen}
        onClose={() => setMembersModalOpen(false)}
        boardId={id}
      />

      {/* Labels Modal */}
      <LabelsModal
        open={labelsModalOpen}
        onClose={() => setLabelsModalOpen(false)}
        boardId={id}
      />
    </DashboardLayout>
  )
}
