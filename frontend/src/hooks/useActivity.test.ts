import { describe, it, expect, vi, beforeEach } from 'vitest';
import { waitFor } from '@testing-library/react';
import { renderHookWithClient } from '../test/hookTestUtils';
import { useActivity } from './useActivity';
import { activityApi } from '../api/activity';
import type { ActivityDto, GetActivityParams } from '../types/api';

// Mock the API module
vi.mock('../api/activity');

describe('useActivity hook', () => {
  const mockActivity: ActivityDto = {
    id: 'history-1',
    taskId: 'task-1',
    taskTitle: 'Test Task',
    boardId: 'board-1',
    boardName: 'Test Board',
    userId: 'user-1',
    action: 'Updated',
    fieldName: 'title',
    oldValue: 'Old Title',
    newValue: 'New Title',
    createdAt: '2025-01-01T00:00:00.000Z',
    user: {
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

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useActivity', () => {
    it('fetches activity successfully without filters', async () => {
      vi.mocked(activityApi.getActivity).mockResolvedValue([mockActivity]);

      const { result } = renderHookWithClient(() => useActivity());

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toHaveLength(1);
      expect(result.current.data?.[0]).toEqual(mockActivity);
      expect(activityApi.getActivity).toHaveBeenCalledWith(undefined);
    });

    it('fetches activity with board filter', async () => {
      const params: GetActivityParams = { boardId: 'board-1' };
      vi.mocked(activityApi.getActivity).mockResolvedValue([mockActivity]);

      const { result } = renderHookWithClient(() => useActivity(params));

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(activityApi.getActivity).toHaveBeenCalledWith(params);
      expect(result.current.data?.[0].boardId).toBe('board-1');
    });

    it('fetches activity with action type filter', async () => {
      const params: GetActivityParams = { actionType: 'Updated' };
      vi.mocked(activityApi.getActivity).mockResolvedValue([mockActivity]);

      const { result } = renderHookWithClient(() => useActivity(params));

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(activityApi.getActivity).toHaveBeenCalledWith(params);
      expect(result.current.data?.[0].action).toBe('Updated');
    });

    it('fetches activity with limit parameter', async () => {
      const params: GetActivityParams = { limit: 50 };
      vi.mocked(activityApi.getActivity).mockResolvedValue([mockActivity]);

      const { result } = renderHookWithClient(() => useActivity(params));

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(activityApi.getActivity).toHaveBeenCalledWith(params);
    });

    it('fetches activity with combined filters', async () => {
      const params: GetActivityParams = {
        boardId: 'board-1',
        limit: 25,
      };
      vi.mocked(activityApi.getActivity).mockResolvedValue([mockActivity]);

      const { result } = renderHookWithClient(() => useActivity(params));

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(activityApi.getActivity).toHaveBeenCalledWith(params);
      expect(result.current.data?.[0]).toEqual(mockActivity);
    });

    it('returns empty array when no activity found', async () => {
      vi.mocked(activityApi.getActivity).mockResolvedValue([]);

      const { result } = renderHookWithClient(() => useActivity());

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([]);
    });

    it('handles fetch errors', async () => {
      const error = new Error('Network error');
      vi.mocked(activityApi.getActivity).mockRejectedValue(error);

      const { result } = renderHookWithClient(() => useActivity());

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeTruthy();
    });

    it('caches results with different filter combinations', async () => {
      // First query with board filter
      const params1: GetActivityParams = { boardId: 'board-1' };
      vi.mocked(activityApi.getActivity).mockResolvedValue([mockActivity]);

      const { result: result1 } = renderHookWithClient(() => useActivity(params1));

      await waitFor(() => {
        expect(result1.current.isSuccess).toBe(true);
      });

      // Second query with different filter
      const params2: GetActivityParams = { boardId: 'board-2' };
      const activity2 = { ...mockActivity, boardId: 'board-2', boardName: 'Board 2' };
      vi.mocked(activityApi.getActivity).mockResolvedValue([activity2]);

      const { result: result2 } = renderHookWithClient(() => useActivity(params2));

      await waitFor(() => {
        expect(result2.current.isSuccess).toBe(true);
      });

      // Verify both API calls were made
      expect(activityApi.getActivity).toHaveBeenCalledTimes(2);
      expect(activityApi.getActivity).toHaveBeenCalledWith(params1);
      expect(activityApi.getActivity).toHaveBeenCalledWith(params2);
    });
  });
});
