import { describe, it, expect, vi, beforeEach } from 'vitest';
import { waitFor } from '@testing-library/react';
import { renderHookWithClient } from '../test/hookTestUtils';
import {
  useTask,
  useTasksByBoard,
  useTasksByColumn,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useMoveTask,
  useArchiveTask,
  useAssignTask,
} from './useTasks';
import { tasksApi } from '../api/tasks';
import type { TaskDto, TaskListDto, CreateTaskRequest, UpdateTaskRequest } from '../types/api';
import { Priority } from '../types/api';

// Mock the API module
vi.mock('../api/tasks');

// Mock toast notifications
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('useTasks hooks', () => {
  const mockTaskDto: TaskDto = {
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
  };

  const mockTaskListDto: TaskListDto = {
    id: 'task-1',
    title: 'Test Task',
    boardId: 'board-1',
    columnId: 'column-1',
    statusId: 'status-1',
    typeId: 'type-1',
    positionIndex: 0,
    priority: 1,
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
    subTaskCount: 0,
    completedSubTaskCount: 0,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useTask', () => {
    it('fetches a single task successfully', async () => {
      vi.mocked(tasksApi.getTask).mockResolvedValue(mockTaskDto);

      const { result } = renderHookWithClient(() => useTask('task-1'));

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockTaskDto);
      expect(tasksApi.getTask).toHaveBeenCalledWith('task-1');
    });

    it('handles fetch errors', async () => {
      const error = new Error('Network error');
      vi.mocked(tasksApi.getTask).mockRejectedValue(error);

      const { result } = renderHookWithClient(() => useTask('task-1'));

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeTruthy();
    });
  });

  describe('useTasksByBoard', () => {
    it('fetches tasks by board successfully', async () => {
      vi.mocked(tasksApi.getTasksByBoard).mockResolvedValue([mockTaskListDto]);

      const { result } = renderHookWithClient(() => useTasksByBoard('board-1'));

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toHaveLength(1);
      expect(result.current.data?.[0]).toEqual(mockTaskListDto);
      expect(tasksApi.getTasksByBoard).toHaveBeenCalledWith('board-1');
    });

    it('returns empty array when no tasks found', async () => {
      vi.mocked(tasksApi.getTasksByBoard).mockResolvedValue([]);

      const { result } = renderHookWithClient(() => useTasksByBoard('board-1'));

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([]);
    });
  });

  describe('useTasksByColumn', () => {
    it('fetches tasks by column successfully', async () => {
      vi.mocked(tasksApi.getTasksByColumn).mockResolvedValue([mockTaskListDto]);

      const { result } = renderHookWithClient(() => useTasksByColumn('column-1'));

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toHaveLength(1);
      expect(tasksApi.getTasksByColumn).toHaveBeenCalledWith('column-1');
    });
  });

  describe('useCreateTask', () => {
    it('creates a task successfully', async () => {
      const newTask: CreateTaskRequest = {
        title: 'New Task',
        boardId: 'board-1',
        columnId: 'column-1',
        statusId: 'status-1',
        typeId: 'type-1',
        priority: Priority.Medium,
      };

      vi.mocked(tasksApi.createTask).mockResolvedValue(mockTaskDto);

      const { result } = renderHookWithClient(() => useCreateTask());

      await result.current.mutateAsync(newTask);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(tasksApi.createTask).toHaveBeenCalledWith(newTask);
      expect(result.current.data).toEqual(mockTaskDto);
    });

    it('handles creation errors', async () => {
      const newTask: CreateTaskRequest = {
        title: 'New Task',
        boardId: 'board-1',
        columnId: 'column-1',
        statusId: 'status-1',
        typeId: 'type-1',
        priority: Priority.Medium,
      };

      const error = new Error('Creation failed');
      vi.mocked(tasksApi.createTask).mockRejectedValue(error);

      const { result } = renderHookWithClient(() => useCreateTask());

      await expect(result.current.mutateAsync(newTask)).rejects.toThrow('Creation failed');
    });
  });

  describe('useUpdateTask', () => {
    it('updates a task successfully', async () => {
      const updateData: UpdateTaskRequest = {
        title: 'Updated Task',
        description: 'Updated description',
        statusId: 'status-1',
        typeId: 'type-1',
        priority: Priority.Medium,
      };

      const updatedTask = { ...mockTaskDto, ...updateData };
      vi.mocked(tasksApi.updateTask).mockResolvedValue(updatedTask);

      const { result } = renderHookWithClient(() => useUpdateTask());

      await result.current.mutateAsync({ id: 'task-1', data: updateData });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(tasksApi.updateTask).toHaveBeenCalledWith('task-1', updateData);
      expect(result.current.data).toEqual(updatedTask);
    });

    it('handles update errors', async () => {
      const updateData: UpdateTaskRequest = {
        title: 'Updated Task',
        statusId: 'status-1',
        typeId: 'type-1',
        priority: Priority.Medium,
      };
      const error = new Error('Update failed');
      vi.mocked(tasksApi.updateTask).mockRejectedValue(error);

      const { result } = renderHookWithClient(() => useUpdateTask());

      await expect(
        result.current.mutateAsync({ id: 'task-1', data: updateData })
      ).rejects.toThrow('Update failed');
    });
  });

  describe('useDeleteTask', () => {
    it('deletes a task successfully', async () => {
      vi.mocked(tasksApi.deleteTask).mockResolvedValue(undefined);

      const { result } = renderHookWithClient(() => useDeleteTask());

      await result.current.mutateAsync('task-1');

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(tasksApi.deleteTask).toHaveBeenCalledWith('task-1');
    });

    it('handles deletion errors', async () => {
      const error = new Error('Deletion failed');
      vi.mocked(tasksApi.deleteTask).mockRejectedValue(error);

      const { result } = renderHookWithClient(() => useDeleteTask());

      await expect(result.current.mutateAsync('task-1')).rejects.toThrow('Deletion failed');
    });
  });

  describe('useMoveTask', () => {
    it('moves a task successfully', async () => {
      vi.mocked(tasksApi.moveTask).mockResolvedValue(undefined);

      const { result } = renderHookWithClient(() => useMoveTask());

      await result.current.mutateAsync({
        id: 'task-1',
        data: {
          columnId: 'column-2',
          positionIndex: 1,
        },
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(tasksApi.moveTask).toHaveBeenCalledWith('task-1', {
        columnId: 'column-2',
        positionIndex: 1,
      });
    });

    it('handles move errors', async () => {
      const error = new Error('Move failed');
      vi.mocked(tasksApi.moveTask).mockRejectedValue(error);

      const { result } = renderHookWithClient(() => useMoveTask());

      await expect(
        result.current.mutateAsync({
          id: 'task-1',
          data: {
            columnId: 'column-2',
            positionIndex: 1,
          },
        })
      ).rejects.toThrow('Move failed');
    });
  });

  describe('useArchiveTask', () => {
    it('archives a task successfully', async () => {
      vi.mocked(tasksApi.archiveTask).mockResolvedValue(undefined);

      const { result } = renderHookWithClient(() => useArchiveTask());

      await result.current.mutateAsync('task-1');

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(tasksApi.archiveTask).toHaveBeenCalledWith('task-1');
    });

    it('handles archive errors', async () => {
      const error = new Error('Archive failed');
      vi.mocked(tasksApi.archiveTask).mockRejectedValue(error);

      const { result } = renderHookWithClient(() => useArchiveTask());

      await expect(result.current.mutateAsync('task-1')).rejects.toThrow('Archive failed');
    });
  });

  describe('useAssignTask', () => {
    it('assigns a task successfully', async () => {
      vi.mocked(tasksApi.assignTask).mockResolvedValue(undefined);

      const { result } = renderHookWithClient(() => useAssignTask());

      await result.current.mutateAsync({ id: 'task-1', data: { assigneeId: 'user-1' } });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(tasksApi.assignTask).toHaveBeenCalledWith('task-1', { assigneeId: 'user-1' });
    });

    it('unassigns a task successfully', async () => {
      vi.mocked(tasksApi.assignTask).mockResolvedValue(undefined);

      const { result } = renderHookWithClient(() => useAssignTask());

      await result.current.mutateAsync({ id: 'task-1', data: { assigneeId: undefined } });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(tasksApi.assignTask).toHaveBeenCalledWith('task-1', { assigneeId: undefined });
    });

    it('handles assignment errors', async () => {
      const error = new Error('Assignment failed');
      vi.mocked(tasksApi.assignTask).mockRejectedValue(error);

      const { result } = renderHookWithClient(() => useAssignTask());

      await expect(
        result.current.mutateAsync({ id: 'task-1', data: { assigneeId: 'user-1' } })
      ).rejects.toThrow('Assignment failed');
    });
  });
});
