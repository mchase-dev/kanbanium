import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BoardColumn } from './BoardColumn';
import type { ColumnDto, TaskListDto } from '../../types/api';

// Mock dnd-kit
let mockIsOver = false;
vi.mock('@dnd-kit/core', () => ({
  useDroppable: () => ({
    setNodeRef: vi.fn(),
    isOver: mockIsOver,
  }),
}));

vi.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: any) => <div data-testid="sortable-context">{children}</div>,
  verticalListSortingStrategy: {},
}));

// Mock TaskCard component
vi.mock('../task/TaskCard', () => ({
  TaskCard: ({ task, onClick }: any) => (
    <div data-testid="task-card" onClick={onClick}>
      {task.title}
    </div>
  ),
}));

describe('BoardColumn', () => {
  const mockColumn: ColumnDto = {
    id: 'column-1',
    name: 'To Do',
    boardId: 'board-1',
    position: 0,
    wipLimit: undefined,
  };

  const mockTasks: TaskListDto[] = [
    {
      id: 'task-1',
      title: 'First Task',
      boardId: 'board-1',
      columnId: 'column-1',
      statusId: 'status-1',
      typeId: 'type-1',
      positionIndex: 0,
      priority: 0,
      isArchived: false,
      createdAt: '2025-01-01T00:00:00.000Z',
      status: {
        id: 'status-1',
        name: 'To Do',
        category: 0,
        color: '#3B82F6',
      },
      type: {
        id: 'type-1',
        name: 'Task',
        icon: '📋',
        color: '#3B82F6',
      },
      labels: [],
      subTaskCount: 0,
      completedSubTaskCount: 0,
    },
    {
      id: 'task-2',
      title: 'Second Task',
      boardId: 'board-1',
      columnId: 'column-1',
      statusId: 'status-1',
      typeId: 'type-1',
      positionIndex: 1,
      priority: 1,
      isArchived: false,
      createdAt: '2025-01-01T00:00:00.000Z',
      status: {
        id: 'status-1',
        name: 'To Do',
        category: 0,
        color: '#3B82F6',
      },
      type: {
        id: 'type-1',
        name: 'Task',
        icon: '📋',
        color: '#3B82F6',
      },
      labels: [],
      subTaskCount: 0,
      completedSubTaskCount: 0,
    },
  ];

  beforeEach(() => {
    mockIsOver = false;
  });

  it('renders column name', () => {
    render(<BoardColumn column={mockColumn} tasks={[]} />);
    expect(screen.getByText('To Do')).toBeInTheDocument();
  });

  it('renders task count badge with correct count', () => {
    render(<BoardColumn column={mockColumn} tasks={mockTasks} />);
    const badge = screen.getByText('2');
    expect(badge).toBeInTheDocument();
  });

  it('renders task count badge with zero when no tasks', () => {
    const { container } = render(<BoardColumn column={mockColumn} tasks={[]} />);
    // Ant Design Badge doesn't show "0" by default, but the badge element should exist
    const badge = container.querySelector('.ant-badge');
    expect(badge).toBeInTheDocument();
  });

  it('renders all tasks in the column', () => {
    render(<BoardColumn column={mockColumn} tasks={mockTasks} />);
    expect(screen.getByText('First Task')).toBeInTheDocument();
    expect(screen.getByText('Second Task')).toBeInTheDocument();
    expect(screen.getAllByTestId('task-card')).toHaveLength(2);
  });

  it('renders empty state when no tasks', () => {
    render(<BoardColumn column={mockColumn} tasks={[]} />);
    expect(screen.getByText('No tasks in this column')).toBeInTheDocument();
  });

  it('does not render empty state when tasks exist', () => {
    render(<BoardColumn column={mockColumn} tasks={mockTasks} />);
    expect(screen.queryByText('No tasks in this column')).not.toBeInTheDocument();
  });

  it('renders Add Task button', () => {
    render(<BoardColumn column={mockColumn} tasks={[]} />);
    expect(screen.getByRole('button', { name: /add task/i })).toBeInTheDocument();
  });

  it('calls onAddTask when Add Task button is clicked', async () => {
    const handleAddTask = vi.fn();
    const user = userEvent.setup();

    render(<BoardColumn column={mockColumn} tasks={[]} onAddTask={handleAddTask} />);

    const addButton = screen.getByRole('button', { name: /add task/i });
    await user.click(addButton);

    expect(handleAddTask).toHaveBeenCalledTimes(1);
  });

  it('does not error when Add Task is clicked without onAddTask handler', async () => {
    const user = userEvent.setup();

    render(<BoardColumn column={mockColumn} tasks={[]} />);

    const addButton = screen.getByRole('button', { name: /add task/i });
    await user.click(addButton);

    // Should not throw error
    expect(addButton).toBeInTheDocument();
  });

  it('renders More options button', () => {
    render(<BoardColumn column={mockColumn} tasks={[]} />);
    // The MoreOutlined icon button is rendered as a text button with an icon
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(1); // Should have both More and Add Task buttons
  });

  it('calls onTaskClick when a task is clicked', async () => {
    const handleTaskClick = vi.fn();
    const user = userEvent.setup();

    render(
      <BoardColumn column={mockColumn} tasks={mockTasks} onTaskClick={handleTaskClick} />
    );

    const firstTaskCard = screen.getByText('First Task');
    await user.click(firstTaskCard);

    expect(handleTaskClick).toHaveBeenCalledTimes(1);
    expect(handleTaskClick).toHaveBeenCalledWith(mockTasks[0]);
  });

  it('does not error when task is clicked without onTaskClick handler', async () => {
    const user = userEvent.setup();

    render(<BoardColumn column={mockColumn} tasks={mockTasks} />);

    const firstTaskCard = screen.getByText('First Task');
    await user.click(firstTaskCard);

    // Should not throw error
    expect(firstTaskCard).toBeInTheDocument();
  });

  it('renders SortableContext for drag and drop', () => {
    render(<BoardColumn column={mockColumn} tasks={mockTasks} />);
    expect(screen.getByTestId('sortable-context')).toBeInTheDocument();
  });

  it('handles single task correctly', () => {
    const singleTask = [mockTasks[0]];
    render(<BoardColumn column={mockColumn} tasks={singleTask} />);

    expect(screen.getByText('First Task')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument(); // Badge count
    expect(screen.queryByText('No tasks in this column')).not.toBeInTheDocument();
  });
});
