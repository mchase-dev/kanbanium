import { describe, it, expect, vi, beforeEach } from 'vitest';
import { waitFor } from '@testing-library/react';
import { renderHookWithClient } from '../test/hookTestUtils';
import {
  useLabelsByBoard,
  useCreateLabel,
  useUpdateLabel,
  useDeleteLabel,
  useAddTaskLabel,
  useRemoveTaskLabel,
} from './useLabels';
import { labelsApi } from '../api/labels';
import type { Label, CreateLabelRequest } from '../types/api';

// Mock the API module
vi.mock('../api/labels');

// Mock toast notifications
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('useLabels hooks', () => {
  const mockLabel: Label = {
    id: 'label-1',
    boardId: 'board-1',
    name: 'Bug',
    color: '#EF4444',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useLabelsByBoard', () => {
    it('fetches labels by board successfully', async () => {
      vi.mocked(labelsApi.getLabelsByBoard).mockResolvedValue([mockLabel]);

      const { result } = renderHookWithClient(() => useLabelsByBoard('board-1'));

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toHaveLength(1);
      expect(result.current.data?.[0]).toEqual(mockLabel);
      expect(labelsApi.getLabelsByBoard).toHaveBeenCalledWith('board-1');
    });

    it('returns empty array when no labels found', async () => {
      vi.mocked(labelsApi.getLabelsByBoard).mockResolvedValue([]);

      const { result } = renderHookWithClient(() => useLabelsByBoard('board-1'));

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([]);
    });

    it('does not fetch when boardId is empty', () => {
      const { result } = renderHookWithClient(() => useLabelsByBoard(''));

      expect(result.current.isFetching).toBe(false);
      expect(labelsApi.getLabelsByBoard).not.toHaveBeenCalled();
    });

    it('handles fetch errors', async () => {
      const error = new Error('Network error');
      vi.mocked(labelsApi.getLabelsByBoard).mockRejectedValue(error);

      const { result } = renderHookWithClient(() => useLabelsByBoard('board-1'));

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeTruthy();
    });
  });

  describe('useCreateLabel', () => {
    it('creates a label successfully', async () => {
      const newLabel: CreateLabelRequest = {
        boardId: 'board-1',
        name: 'Feature',
        color: '#8B5CF6',
      };

      vi.mocked(labelsApi.createLabel).mockResolvedValue(mockLabel);

      const { result } = renderHookWithClient(() => useCreateLabel());

      await result.current.mutateAsync(newLabel);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(labelsApi.createLabel).toHaveBeenCalledWith(newLabel);
      expect(result.current.data).toEqual(mockLabel);
    });

    it('handles creation errors', async () => {
      const newLabel: CreateLabelRequest = {
        boardId: 'board-1',
        name: 'Feature',
        color: '#8B5CF6',
      };

      const error = new Error('Creation failed');
      vi.mocked(labelsApi.createLabel).mockRejectedValue(error);

      const { result } = renderHookWithClient(() => useCreateLabel());

      await expect(result.current.mutateAsync(newLabel)).rejects.toThrow('Creation failed');
    });
  });

  describe('useUpdateLabel', () => {
    it('updates a label successfully', async () => {
      const updateData = { name: 'Critical Bug', color: '#DC2626' };
      const updatedLabel = { ...mockLabel, ...updateData };

      vi.mocked(labelsApi.updateLabel).mockResolvedValue(updatedLabel);

      const { result } = renderHookWithClient(() => useUpdateLabel());

      await result.current.mutateAsync({
        id: 'label-1',
        boardId: 'board-1',
        data: updateData
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(labelsApi.updateLabel).toHaveBeenCalledWith('label-1', updateData);
      expect(result.current.data).toEqual(updatedLabel);
    });

    it('handles update errors', async () => {
      const updateData = { name: 'Updated Label', color: '#000000' };
      const error = new Error('Update failed');

      vi.mocked(labelsApi.updateLabel).mockRejectedValue(error);

      const { result } = renderHookWithClient(() => useUpdateLabel());

      await expect(
        result.current.mutateAsync({
          id: 'label-1',
          boardId: 'board-1',
          data: updateData
        })
      ).rejects.toThrow('Update failed');
    });
  });

  describe('useDeleteLabel', () => {
    it('deletes a label successfully', async () => {
      vi.mocked(labelsApi.deleteLabel).mockResolvedValue(undefined);

      const { result } = renderHookWithClient(() => useDeleteLabel());

      await result.current.mutateAsync({ id: 'label-1', boardId: 'board-1' });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(labelsApi.deleteLabel).toHaveBeenCalledWith('label-1');
    });

    it('handles deletion errors', async () => {
      const error = new Error('Deletion failed');
      vi.mocked(labelsApi.deleteLabel).mockRejectedValue(error);

      const { result } = renderHookWithClient(() => useDeleteLabel());

      await expect(
        result.current.mutateAsync({ id: 'label-1', boardId: 'board-1' })
      ).rejects.toThrow('Deletion failed');
    });
  });

  describe('useAddTaskLabel', () => {
    it('adds label to task successfully', async () => {
      vi.mocked(labelsApi.addTaskLabel).mockResolvedValue(undefined);

      const { result } = renderHookWithClient(() => useAddTaskLabel());

      await result.current.mutateAsync({ taskId: 'task-1', labelId: 'label-1' });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(labelsApi.addTaskLabel).toHaveBeenCalledWith('task-1', 'label-1');
    });

    it('handles add label errors', async () => {
      const error = new Error('Add label failed');
      vi.mocked(labelsApi.addTaskLabel).mockRejectedValue(error);

      const { result } = renderHookWithClient(() => useAddTaskLabel());

      await expect(
        result.current.mutateAsync({ taskId: 'task-1', labelId: 'label-1' })
      ).rejects.toThrow('Add label failed');
    });
  });

  describe('useRemoveTaskLabel', () => {
    it('removes label from task successfully', async () => {
      vi.mocked(labelsApi.removeTaskLabel).mockResolvedValue(undefined);

      const { result } = renderHookWithClient(() => useRemoveTaskLabel());

      await result.current.mutateAsync({ taskId: 'task-1', labelId: 'label-1' });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(labelsApi.removeTaskLabel).toHaveBeenCalledWith('task-1', 'label-1');
    });

    it('handles remove label errors', async () => {
      const error = new Error('Remove label failed');
      vi.mocked(labelsApi.removeTaskLabel).mockRejectedValue(error);

      const { result } = renderHookWithClient(() => useRemoveTaskLabel());

      await expect(
        result.current.mutateAsync({ taskId: 'task-1', labelId: 'label-1' })
      ).rejects.toThrow('Remove label failed');
    });
  });
});
