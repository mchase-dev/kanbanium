import { describe, it, expect, vi, beforeEach } from 'vitest';
import { waitFor } from '@testing-library/react';
import { renderHookWithClient } from '../test/hookTestUtils';
import {
  useCommentsByTask,
  useCreateComment,
  useUpdateComment,
  useDeleteComment,
} from './useComments';
import { commentsApi } from '../api/comments';
import type { CommentDto, CreateCommentRequest, UpdateCommentRequest } from '../types/api';

// Mock the API module
vi.mock('../api/comments');

// Mock toast notifications
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('useComments hooks', () => {
  const mockComment: CommentDto = {
    id: 'comment-1',
    taskId: 'task-1',
    content: 'This is a test comment',
    userId: 'user-1',
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
    createdAt: '2025-01-01T00:00:00.000Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useCommentsByTask', () => {
    it('fetches comments by task successfully', async () => {
      vi.mocked(commentsApi.getCommentsByTask).mockResolvedValue([mockComment]);

      const { result } = renderHookWithClient(() => useCommentsByTask('task-1'));

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toHaveLength(1);
      expect(result.current.data?.[0]).toEqual(mockComment);
      expect(commentsApi.getCommentsByTask).toHaveBeenCalledWith('task-1');
    });

    it('returns empty array when no comments found', async () => {
      vi.mocked(commentsApi.getCommentsByTask).mockResolvedValue([]);

      const { result } = renderHookWithClient(() => useCommentsByTask('task-1'));

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([]);
    });

    it('does not fetch when taskId is empty', () => {
      const { result } = renderHookWithClient(() => useCommentsByTask(''));

      expect(result.current.isFetching).toBe(false);
      expect(commentsApi.getCommentsByTask).not.toHaveBeenCalled();
    });

    it('handles fetch errors', async () => {
      const error = new Error('Network error');
      vi.mocked(commentsApi.getCommentsByTask).mockRejectedValue(error);

      const { result } = renderHookWithClient(() => useCommentsByTask('task-1'));

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeTruthy();
    });
  });

  describe('useCreateComment', () => {
    it('creates a comment successfully', async () => {
      const newComment: CreateCommentRequest = {
        taskId: 'task-1',
        content: 'New comment content',
      };

      vi.mocked(commentsApi.createComment).mockResolvedValue(mockComment);

      const { result } = renderHookWithClient(() => useCreateComment());

      await result.current.mutateAsync(newComment);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(commentsApi.createComment).toHaveBeenCalledWith(newComment);
      expect(result.current.data).toEqual(mockComment);
    });

    it('handles creation errors', async () => {
      const newComment: CreateCommentRequest = {
        taskId: 'task-1',
        content: 'New comment content',
      };

      const error = new Error('Creation failed');
      vi.mocked(commentsApi.createComment).mockRejectedValue(error);

      const { result } = renderHookWithClient(() => useCreateComment());

      await expect(result.current.mutateAsync(newComment)).rejects.toThrow('Creation failed');
    });
  });

  describe('useUpdateComment', () => {
    it('updates a comment successfully', async () => {
      const updateData: UpdateCommentRequest = {
        id: 'comment-1',
        content: 'Updated comment content',
      };

      const updatedComment = {
        ...mockComment,
        ...updateData,
      };

      vi.mocked(commentsApi.updateComment).mockResolvedValue(updatedComment);

      const { result } = renderHookWithClient(() => useUpdateComment());

      await result.current.mutateAsync({
        id: 'comment-1',
        taskId: 'task-1',
        data: updateData,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(commentsApi.updateComment).toHaveBeenCalledWith('comment-1', updateData);
      expect(result.current.data).toEqual(updatedComment);
    });

    it('handles update errors', async () => {
      const updateData: UpdateCommentRequest = {
        id: 'comment-1',
        content: 'Updated comment content',
      };

      const error = new Error('Update failed');
      vi.mocked(commentsApi.updateComment).mockRejectedValue(error);

      const { result } = renderHookWithClient(() => useUpdateComment());

      await expect(
        result.current.mutateAsync({
          id: 'comment-1',
          taskId: 'task-1',
          data: updateData,
        })
      ).rejects.toThrow('Update failed');
    });
  });

  describe('useDeleteComment', () => {
    it('deletes a comment successfully', async () => {
      vi.mocked(commentsApi.deleteComment).mockResolvedValue(undefined);

      const { result } = renderHookWithClient(() => useDeleteComment());

      await result.current.mutateAsync({ id: 'comment-1', taskId: 'task-1' });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(commentsApi.deleteComment).toHaveBeenCalledWith('comment-1');
    });

    it('handles deletion errors', async () => {
      const error = new Error('Deletion failed');
      vi.mocked(commentsApi.deleteComment).mockRejectedValue(error);

      const { result } = renderHookWithClient(() => useDeleteComment());

      await expect(
        result.current.mutateAsync({ id: 'comment-1', taskId: 'task-1' })
      ).rejects.toThrow('Deletion failed');
    });
  });
});
