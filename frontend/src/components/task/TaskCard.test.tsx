import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskCard } from './TaskCard';
import type { TaskListDto } from '../../types/api';
import { Priority } from '../../types/api';

// Mock dnd-kit
vi.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: undefined,
    isDragging: false,
  }),
}));

// Mock child components
vi.mock('../label/LabelBadge', () => ({
  LabelBadge: ({ label }: any) => <span data-testid="label-badge">{label.name}</span>,
}));

vi.mock('../common/UserAvatar', () => ({
  UserAvatar: ({ user }: any) => (
    <div data-testid="user-avatar">{user.firstName} {user.lastName}</div>
  ),
}));

describe('TaskCard', () => {
  const mockTask: TaskListDto = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    title: 'Test Task',
    boardId: '123e4567-e89b-12d3-a456-426614174010',
    columnId: '123e4567-e89b-12d3-a456-426614174001',
    statusId: '123e4567-e89b-12d3-a456-426614174002',
    typeId: '123e4567-e89b-12d3-a456-426614174003',
    positionIndex: 0,
    priority: Priority.Medium,
    isArchived: false,
    createdAt: '2025-01-01T00:00:00.000Z',
    status: {
      id: '123e4567-e89b-12d3-a456-426614174002',
      name: 'In Progress',
      category: 1,
      color: '#3B82F6',
    },
    type: {
      id: '123e4567-e89b-12d3-a456-426614174003',
      name: 'Task',
      icon: '📋',
      color: '#3B82F6',
    },
    labels: [],
    subTaskCount: 0,
    completedSubTaskCount: 0,
  };

  it('renders task title', () => {
    render(<TaskCard task={mockTask} />);
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('renders priority tag for medium priority', () => {
    render(<TaskCard task={mockTask} />);
    expect(screen.getByText('Medium')).toBeInTheDocument();
  });

  it('renders priority tag for high priority', () => {
    const highPriorityTask = { ...mockTask, priority: Priority.High };
    render(<TaskCard task={highPriorityTask} />);
    expect(screen.getByText('High')).toBeInTheDocument();
  });

  it('renders priority tag for critical priority', () => {
    const criticalTask = { ...mockTask, priority: Priority.Critical };
    render(<TaskCard task={criticalTask} />);
    expect(screen.getByText('Critical')).toBeInTheDocument();
  });

  it('does not render priority tag for low priority', () => {
    const lowPriorityTask = { ...mockTask, priority: Priority.Low };
    render(<TaskCard task={lowPriorityTask} />);
    expect(screen.queryByText('Low')).not.toBeInTheDocument();
  });

  it('renders labels when task has labels', () => {
    const taskWithLabels = {
      ...mockTask,
      labels: [
        {
          taskId: mockTask.id,
          labelId: '1',
          label: {
            id: '1',
            name: 'Bug',
            color: '#ff0000',
            boardId: 'board-1',
          },
        },
        {
          taskId: mockTask.id,
          labelId: '2',
          label: {
            id: '2',
            name: 'Feature',
            color: '#00ff00',
            boardId: 'board-1',
          },
        },
      ],
    };
    render(<TaskCard task={taskWithLabels} />);
    expect(screen.getByText('Bug')).toBeInTheDocument();
    expect(screen.getByText('Feature')).toBeInTheDocument();
  });

  it('shows +N tag when there are more than 2 labels', () => {
    const taskWithManyLabels = {
      ...mockTask,
      labels: [
        {
          taskId: mockTask.id,
          labelId: '1',
          label: { id: '1', name: 'Bug', color: '#ff0000', boardId: 'board-1' },
        },
        {
          taskId: mockTask.id,
          labelId: '2',
          label: { id: '2', name: 'Feature', color: '#00ff00', boardId: 'board-1' },
        },
        {
          taskId: mockTask.id,
          labelId: '3',
          label: { id: '3', name: 'Enhancement', color: '#0000ff', boardId: 'board-1' },
        },
      ],
    };
    render(<TaskCard task={taskWithManyLabels} />);
    expect(screen.getByText('+1')).toBeInTheDocument();
  });

  it('renders assignee avatar when task has assignee', () => {
    const taskWithAssignee = {
      ...mockTask,
      assigneeId: 'user-1',
      assignee: {
        id: 'user-1',
        userName: 'johndoe',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        role: 'User',
        isDeleted: false,
        createdAt: '2025-01-01T00:00:00.000Z',
      },
    };
    render(<TaskCard task={taskWithAssignee} />);
    expect(screen.getByTestId('user-avatar')).toHaveTextContent('John Doe');
  });

  it('renders due date when provided', () => {
    const futureDate = new Date('2025-12-31').toISOString();
    const taskWithDueDate = {
      ...mockTask,
      dueDate: futureDate,
    };
    render(<TaskCard task={taskWithDueDate} />);
    // Use regex to match the date format (handles timezone differences)
    const expectedDate = new Date('2025-12-31').toLocaleDateString();
    expect(screen.getByText(expectedDate)).toBeInTheDocument();
  });

  it('shows overdue styling for past due dates', () => {
    const pastDate = new Date('2020-01-01').toISOString();
    const overdueTask = {
      ...mockTask,
      dueDate: pastDate,
    };
    render(<TaskCard task={overdueTask} />);
    // Use toLocaleDateString to get the expected format (handles timezone differences)
    const expectedDate = new Date('2020-01-01').toLocaleDateString();
    const dueDateElement = screen.getByText(expectedDate);
    expect(dueDateElement).toBeInTheDocument();
    // The element itself should have danger type styling
    expect(dueDateElement.classList.contains('ant-typography-danger')).toBe(true);
  });

  it('calls onClick when card is clicked', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<TaskCard task={mockTask} onClick={handleClick} />);

    const card = screen.getByText('Test Task').closest('.ant-card');
    await user.click(card!);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when onClick is not provided', async () => {
    const user = userEvent.setup();

    render(<TaskCard task={mockTask} />);

    const card = screen.getByText('Test Task').closest('.ant-card');
    await user.click(card!);

    // Should not throw error
    expect(card).toBeInTheDocument();
  });
});
