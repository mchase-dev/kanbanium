import { describe, it, expect, vi, beforeEach } from 'vitest';
import { waitFor } from '@testing-library/react';
import { renderHookWithClient } from '../test/hookTestUtils';
import {
  useCreateSubTask,
  useUpdateSubTask,
  useDeleteSubTask,
  useToggleSubTask,
} from './useSubTasks';
import { subtasksApi } from '../api/subtasks';
import type { SubTask, CreateSubTaskRequest, UpdateSubTaskRequest } from '../types/api';

// Mock the API module
vi.mock('../api/subtasks');

// Mock toast notifications
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('useSubTasks hooks', () => {
  const mockSubTask: SubTask = {
    id: 'subtask-1',
    taskId: 'task-1',
    title: 'Test Subtask',
    isCompleted: false,
    positionIndex: 0,
    createdAt: '2025-01-01T00:00:00.000Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useCreateSubTask', () => {
    it('creates a subtask successfully', async () => {
      const newSubTask: CreateSubTaskRequest = {
        taskId: 'task-1',
        title: 'New Subtask',
      };

      vi.mocked(subtasksApi.createSubTask).mockResolvedValue(mockSubTask);

      const { result } = renderHookWithClient(() => useCreateSubTask());

      await result.current.mutateAsync(newSubTask);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(subtasksApi.createSubTask).toHaveBeenCalledWith(newSubTask);
      expect(result.current.data).toEqual(mockSubTask);
    });

    it('handles creation errors', async () => {
      const newSubTask: CreateSubTaskRequest = {
        taskId: 'task-1',
        title: 'New Subtask',
      };

      const error = new Error('Creation failed');
      vi.mocked(subtasksApi.createSubTask).mockRejectedValue(error);

      const { result } = renderHookWithClient(() => useCreateSubTask());

      await expect(result.current.mutateAsync(newSubTask)).rejects.toThrow('Creation failed');
    });
  });

  describe('useUpdateSubTask', () => {
    it('updates a subtask successfully', async () => {
      const updateData: UpdateSubTaskRequest = {
        id: 'subtask-1',
        title: 'Updated Subtask',
      };

      const updatedSubTask = { ...mockSubTask, ...updateData };
      vi.mocked(subtasksApi.updateSubTask).mockResolvedValue(updatedSubTask);

      const { result } = renderHookWithClient(() => useUpdateSubTask());

      await result.current.mutateAsync({ id: 'subtask-1', data: updateData });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(subtasksApi.updateSubTask).toHaveBeenCalledWith('subtask-1', updateData);
      expect(result.current.data).toEqual(updatedSubTask);
    });

    it('handles update errors', async () => {
      const updateData: UpdateSubTaskRequest = { id: 'subtask-1', title: 'Updated Subtask' };
      const error = new Error('Update failed');
      vi.mocked(subtasksApi.updateSubTask).mockRejectedValue(error);

      const { result } = renderHookWithClient(() => useUpdateSubTask());

      await expect(
        result.current.mutateAsync({ id: 'subtask-1', data: updateData })
      ).rejects.toThrow('Update failed');
    });
  });

  describe('useDeleteSubTask', () => {
    it('deletes a subtask successfully', async () => {
      vi.mocked(subtasksApi.deleteSubTask).mockResolvedValue(undefined);

      const { result } = renderHookWithClient(() => useDeleteSubTask());

      await result.current.mutateAsync({ id: 'subtask-1', taskId: 'task-1' });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(subtasksApi.deleteSubTask).toHaveBeenCalledWith('subtask-1');
    });

    it('handles deletion errors', async () => {
      const error = new Error('Deletion failed');
      vi.mocked(subtasksApi.deleteSubTask).mockRejectedValue(error);

      const { result } = renderHookWithClient(() => useDeleteSubTask());

      await expect(
        result.current.mutateAsync({ id: 'subtask-1', taskId: 'task-1' })
      ).rejects.toThrow('Deletion failed');
    });
  });

  describe('useToggleSubTask', () => {
    it('toggles a subtask to completed successfully', async () => {
      const completedSubTask = { ...mockSubTask, isCompleted: true };
      vi.mocked(subtasksApi.toggleSubTask).mockResolvedValue(completedSubTask);

      const { result } = renderHookWithClient(() => useToggleSubTask());

      await result.current.mutateAsync('subtask-1');

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(subtasksApi.toggleSubTask).toHaveBeenCalledWith('subtask-1');
      expect(result.current.data).toEqual(completedSubTask);
    });

    it('toggles a subtask to not completed successfully', async () => {
      const incompletedSubTask = { ...mockSubTask, isCompleted: false };
      vi.mocked(subtasksApi.toggleSubTask).mockResolvedValue(incompletedSubTask);

      const { result } = renderHookWithClient(() => useToggleSubTask());

      await result.current.mutateAsync('subtask-1');

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.isCompleted).toBe(false);
    });

    it('handles toggle errors', async () => {
      const error = new Error('Toggle failed');
      vi.mocked(subtasksApi.toggleSubTask).mockRejectedValue(error);

      const { result } = renderHookWithClient(() => useToggleSubTask());

      await expect(result.current.mutateAsync('subtask-1')).rejects.toThrow('Toggle failed');
    });
  });
});
