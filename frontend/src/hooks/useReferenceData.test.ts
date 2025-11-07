import { describe, it, expect, vi, beforeEach } from 'vitest';
import { waitFor } from '@testing-library/react';
import { renderHookWithClient } from '../test/hookTestUtils';
import { useStatuses, useTaskTypes } from './useReferenceData';
import { referenceDataApi } from '../api/reference-data';
import type { Status, TaskType } from '../types/api';

// Mock the API module
vi.mock('../api/reference-data');

describe('useReferenceData hooks', () => {
  const mockStatus: Status = {
    id: 'status-1',
    name: 'In Progress',
    category: 1,
    color: '#3B82F6',
  };

  const mockTaskType: TaskType = {
    id: 'type-1',
    name: 'Task',
    icon: '📋',
    color: '#3B82F6',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useStatuses', () => {
    it('fetches statuses successfully', async () => {
      vi.mocked(referenceDataApi.getStatuses).mockResolvedValue([mockStatus]);

      const { result } = renderHookWithClient(() => useStatuses());

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toHaveLength(1);
      expect(result.current.data?.[0]).toEqual(mockStatus);
      expect(referenceDataApi.getStatuses).toHaveBeenCalled();
    });

    it('returns empty array when no statuses found', async () => {
      vi.mocked(referenceDataApi.getStatuses).mockResolvedValue([]);

      const { result } = renderHookWithClient(() => useStatuses());

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([]);
    });

    it('handles fetch errors', async () => {
      const error = new Error('Network error');
      vi.mocked(referenceDataApi.getStatuses).mockRejectedValue(error);

      const { result } = renderHookWithClient(() => useStatuses());

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeTruthy();
    });
  });

  describe('useTaskTypes', () => {
    it('fetches task types successfully', async () => {
      vi.mocked(referenceDataApi.getTaskTypes).mockResolvedValue([mockTaskType]);

      const { result } = renderHookWithClient(() => useTaskTypes());

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toHaveLength(1);
      expect(result.current.data?.[0]).toEqual(mockTaskType);
      expect(referenceDataApi.getTaskTypes).toHaveBeenCalled();
    });

    it('returns empty array when no task types found', async () => {
      vi.mocked(referenceDataApi.getTaskTypes).mockResolvedValue([]);

      const { result } = renderHookWithClient(() => useTaskTypes());

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([]);
    });

    it('handles fetch errors', async () => {
      const error = new Error('Network error');
      vi.mocked(referenceDataApi.getTaskTypes).mockRejectedValue(error);

      const { result } = renderHookWithClient(() => useTaskTypes());

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeTruthy();
    });
  });
});
