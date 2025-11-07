import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskModal } from './TaskModal';
import type { TaskDto } from '../../types/api';
import { Priority } from '../../types/api';

// Don't mock dayjs - use the real library

// Mock hooks
const mockTaskData: TaskDto = {
  id: 'task-1',
  title: 'Test Task',
  description: 'Test description',
  boardId: 'board-1',
  columnId: 'column-1',
  statusId: 'status-1',
  typeId: 'type-1',
  positionIndex: 0,
  priority: Priority.Medium,
  isArchived: false,
  createdAt: '2025-01-01T00:00:00.000Z',
  status: {
    id: 'status-1',
    name: 'In Progress',
    category: 1,
    color: '#3B82F6',
  },
  type: {
    id: 'type-1',
    name: 'Task',
    icon: '📋',
    color: '#3B82F6',
  },
  labels: [],
  subTasks: [],
  watchers: [],
  commentCount: 0,
  attachmentCount: 0,
  subTaskCount: 0,
  completedSubTaskCount: 0,
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
  dueDate: '2025-12-31T00:00:00.000Z',
};

let mockUseTaskReturn: { data: TaskDto | undefined; isLoading: boolean } = { data: mockTaskData, isLoading: false };
const mockUpdateTask = vi.fn();
const mockDeleteTask = vi.fn();

vi.mock('../../hooks/useTasks', () => ({
  useTask: () => mockUseTaskReturn,
  useUpdateTask: () => ({
    mutateAsync: mockUpdateTask,
    isPending: false,
  }),
  useDeleteTask: () => ({
    mutateAsync: mockDeleteTask,
  }),
}));

vi.mock('../../hooks/useReferenceData', () => ({
  useStatuses: () => ({
    data: [
      { id: 'status-1', name: 'In Progress', category: 1, color: '#3B82F6' },
      { id: 'status-2', name: 'Done', category: 2, color: '#10B981' },
    ],
  }),
  useTaskTypes: () => ({
    data: [
      { id: 'type-1', name: 'Task', icon: '📋', color: '#3B82F6' },
      { id: 'type-2', name: 'Bug', icon: '🐛', color: '#EF4444' },
    ],
  }),
}));

vi.mock('../../hooks/useBoards', () => ({
  useBoardMembers: () => ({
    data: [
      {
        userId: 'user-1',
        user: { id: 'user-1', firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
      },
    ],
  }),
}));

// Mock child components
vi.mock('./SubTaskList', () => ({
  SubTaskList: () => <div data-testid="subtask-list">Subtasks</div>,
}));

vi.mock('../label/LabelPicker', () => ({
  LabelPicker: () => <div data-testid="label-picker">Labels</div>,
}));

vi.mock('./TaskComments', () => ({
  TaskComments: () => <div data-testid="task-comments">Comments</div>,
}));

vi.mock('./TaskAttachments', () => ({
  TaskAttachments: () => <div data-testid="task-attachments">Attachments</div>,
}));

vi.mock('./TaskActivity', () => ({
  TaskActivity: () => <div data-testid="task-activity">Activity</div>,
}));

vi.mock('./TaskWatchers', () => ({
  TaskWatchers: () => <div data-testid="task-watchers">Watchers</div>,
}));

vi.mock('../common/UserAvatar', () => ({
  UserAvatar: ({ user }: any) => <span>{user.firstName}</span>,
}));

// Mock Modal.confirm
const mockModalConfirm = vi.fn();
vi.mock('antd', async () => {
  const actual = await vi.importActual('antd') as any;
  // Create a wrapper for Modal that preserves the component but adds confirm
  const ModalWithConfirm = actual.Modal;
  ModalWithConfirm.confirm = (config: any) => {
    mockModalConfirm(config);
    return config;
  };
  return {
    ...actual,
    Modal: ModalWithConfirm,
  };
});

describe('TaskModal', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockUseTaskReturn = { data: mockTaskData, isLoading: false };
    mockUpdateTask.mockClear();
    mockDeleteTask.mockClear();
    mockOnClose.mockClear();
    mockModalConfirm.mockClear();
  });

  it('renders modal when open', async () => {
    render(<TaskModal taskId="task-1" open={true} onClose={mockOnClose} />);
    // Wait for task data to load
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument();
    });
  });

  it('does not render modal when closed', () => {
    render(<TaskModal taskId="task-1" open={false} onClose={mockOnClose} />);
    expect(screen.queryByText('Task')).not.toBeInTheDocument();
  });

  it('shows loading state', async () => {
    mockUseTaskReturn = { data: undefined, isLoading: true };
    render(<TaskModal taskId="task-1" open={true} onClose={mockOnClose} />);
    // Check for skeleton loader instead of "Loading..." text
    // Modal renders in a portal, so query from document
    await waitFor(() => {
      expect(document.querySelector('.ant-skeleton')).toBeInTheDocument();
    });
  });

  it('shows "Task not found" when no task data', () => {
    mockUseTaskReturn = { data: undefined, isLoading: false };
    render(<TaskModal taskId="task-1" open={true} onClose={mockOnClose} />);
    expect(screen.getByText('Task not found')).toBeInTheDocument();
  });

  it('renders task title in form', () => {
    render(<TaskModal taskId="task-1" open={true} onClose={mockOnClose} />);
    const titleInput = screen.getByDisplayValue('Test Task');
    expect(titleInput).toBeInTheDocument();
  });

  it('renders task description in form', () => {
    render(<TaskModal taskId="task-1" open={true} onClose={mockOnClose} />);
    const descriptionInput = screen.getByDisplayValue('Test description');
    expect(descriptionInput).toBeInTheDocument();
  });

  it('renders task type tag', () => {
    render(<TaskModal taskId="task-1" open={true} onClose={mockOnClose} />);
    // Use getAllByText since "Task" appears multiple times
    const taskElements = screen.getAllByText('Task');
    expect(taskElements.length).toBeGreaterThan(0);
  });

  it('renders priority tag', () => {
    render(<TaskModal taskId="task-1" open={true} onClose={mockOnClose} />);
    // Use getAllByText since "Medium" appears multiple times
    const mediumElements = screen.getAllByText('Medium');
    expect(mediumElements.length).toBeGreaterThan(0);
  });

  it('renders assignee information', () => {
    render(<TaskModal taskId="task-1" open={true} onClose={mockOnClose} />);
    expect(screen.getByText(/John Doe/)).toBeInTheDocument();
  });

  it('renders due date', () => {
    render(<TaskModal taskId="task-1" open={true} onClose={mockOnClose} />);
    // The date format from dayjs might be different, just check for the date parts
    expect(screen.getByText(/Dec.*2025/i)).toBeInTheDocument();
  });

  it('does not render priority tag when priority is 0', () => {
    mockUseTaskReturn = { data: { ...mockTaskData, priority: 0 }, isLoading: false };
    render(<TaskModal taskId="task-1" open={true} onClose={mockOnClose} />);
    // Priority 0 (Low) might still be in the select dropdown, just check it's not displayed as a tag
    // The component shows priority tags for > 0, so we're checking tags, not select options
    const priorityTags = screen.queryAllByText('Low').filter(el => el.tagName === 'SPAN' && el.className.includes('ant-tag'));
    expect(priorityTags.length).toBe(0);
  });

  it('renders all tabs', () => {
    render(<TaskModal taskId="task-1" open={true} onClose={mockOnClose} />);
    expect(screen.getByText('Details')).toBeInTheDocument();
    expect(screen.getByText(/Subtasks/)).toBeInTheDocument();
    expect(screen.getByText(/Labels/)).toBeInTheDocument();
    expect(screen.getByText('Activity')).toBeInTheDocument();
    expect(screen.getByText(/Comments/)).toBeInTheDocument();
    expect(screen.getByText(/Attachments/)).toBeInTheDocument();
    expect(screen.getByText(/Watchers/)).toBeInTheDocument();
  });

  it('renders Edit button', () => {
    render(<TaskModal taskId="task-1" open={true} onClose={mockOnClose} />);
    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
  });

  it('renders Close button', () => {
    render(<TaskModal taskId="task-1" open={true} onClose={mockOnClose} />);
    // Multiple close buttons exist (modal X and footer button), just check at least one exists
    const closeButtons = screen.getAllByRole('button', { name: /close/i });
    expect(closeButtons.length).toBeGreaterThan(0);
  });

  it('renders Delete button', () => {
    render(<TaskModal taskId="task-1" open={true} onClose={mockOnClose} />);
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
  });

  it('enables edit mode when Edit button is clicked', async () => {
    const user = userEvent.setup();
    render(<TaskModal taskId="task-1" open={true} onClose={mockOnClose} />);

    const editButton = screen.getByRole('button', { name: /edit/i });
    await user.click(editButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });
  });

  it('shows Save and Cancel buttons in edit mode', async () => {
    const user = userEvent.setup();
    render(<TaskModal taskId="task-1" open={true} onClose={mockOnClose} />);

    const editButton = screen.getByRole('button', { name: /edit/i });
    await user.click(editButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /^edit$/i })).not.toBeInTheDocument();
    });
  });

  it('form inputs are disabled when not in edit mode', () => {
    render(<TaskModal taskId="task-1" open={true} onClose={mockOnClose} />);

    const titleInput = screen.getByDisplayValue('Test Task') as HTMLInputElement;
    expect(titleInput).toBeDisabled();
  });

  it('form inputs are enabled in edit mode', async () => {
    const user = userEvent.setup();
    render(<TaskModal taskId="task-1" open={true} onClose={mockOnClose} />);

    const editButton = screen.getByRole('button', { name: /edit/i });
    await user.click(editButton);

    await waitFor(() => {
      const titleInput = screen.getByDisplayValue('Test Task') as HTMLInputElement;
      expect(titleInput).not.toBeDisabled();
    });
  });

  it('calls updateTask when save is clicked with valid data', async () => {
    const user = userEvent.setup();
    mockUpdateTask.mockResolvedValue({});

    render(<TaskModal taskId="task-1" open={true} onClose={mockOnClose} />);

    const editButton = screen.getByRole('button', { name: /edit/i });
    await user.click(editButton);

    const titleInput = screen.getByDisplayValue('Test Task');
    await user.clear(titleInput);
    await user.type(titleInput, 'Updated Task');

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockUpdateTask).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'task-1',
          data: expect.objectContaining({
            title: 'Updated Task',
          }),
        })
      );
    });
  });

  it('resets form when cancel is clicked', async () => {
    const user = userEvent.setup();
    render(<TaskModal taskId="task-1" open={true} onClose={mockOnClose} />);

    const editButton = screen.getByRole('button', { name: /edit/i });
    await user.click(editButton);

    const titleInput = screen.getByDisplayValue('Test Task');
    await user.clear(titleInput);
    await user.type(titleInput, 'Changed Title');

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument();
      expect(screen.queryByDisplayValue('Changed Title')).not.toBeInTheDocument();
    });
  });

  it('exits edit mode after successful save', async () => {
    const user = userEvent.setup();
    mockUpdateTask.mockResolvedValue({});

    render(<TaskModal taskId="task-1" open={true} onClose={mockOnClose} />);

    const editButton = screen.getByRole('button', { name: /edit/i });
    await user.click(editButton);

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /save changes/i })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
    });
  });

  it('shows delete confirmation dialog when delete is clicked', async () => {
    const user = userEvent.setup();
    render(<TaskModal taskId="task-1" open={true} onClose={mockOnClose} />);

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    expect(mockModalConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Delete Task',
        content: 'Are you sure you want to delete this task? This action cannot be undone.',
      })
    );
  });

  it('calls deleteTask and closes modal on delete confirm', async () => {
    const user = userEvent.setup();
    mockDeleteTask.mockResolvedValue({});

    render(<TaskModal taskId="task-1" open={true} onClose={mockOnClose} />);

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    // Get the confirm config and call onOk
    const confirmConfig = mockModalConfirm.mock.calls[0][0];
    await confirmConfig.onOk();

    expect(mockDeleteTask).toHaveBeenCalledWith('task-1');
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onClose when Close button is clicked', async () => {
    const user = userEvent.setup();
    render(<TaskModal taskId="task-1" open={true} onClose={mockOnClose} />);

    // Multiple close buttons exist, click the first one
    const closeButtons = screen.getAllByRole('button', { name: /close/i });
    await user.click(closeButtons[0]);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('validates required title field', async () => {
    const user = userEvent.setup();
    render(<TaskModal taskId="task-1" open={true} onClose={mockOnClose} />);

    const editButton = screen.getByRole('button', { name: /edit/i });
    await user.click(editButton);

    const titleInput = screen.getByDisplayValue('Test Task');
    await user.clear(titleInput);

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/please enter a title/i)).toBeInTheDocument();
    });

    expect(mockUpdateTask).not.toHaveBeenCalled();
  });
});
