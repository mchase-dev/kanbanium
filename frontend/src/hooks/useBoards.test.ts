import { describe, it, expect, vi, beforeEach } from 'vitest';
import { waitFor } from '@testing-library/react';
import { renderHookWithClient } from '../test/hookTestUtils';
import {
  useBoards,
  useBoard,
  useBoardMembers,
  useCreateBoard,
  useUpdateBoard,
  useDeleteBoard,
} from './useBoards';
import { boardsApi } from '../api/boards';
import type { Board, BoardListDto, BoardMember, CreateBoardRequest, UpdateBoardRequest } from '../types/api';
import { BoardRole } from '../types/api';

// Mock the API module
vi.mock('../api/boards');

// Mock toast notifications
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('useBoards hooks', () => {
  const mockBoardListDto: BoardListDto = {
    id: 'board-1',
    name: 'Test Board',
    description: 'Test description',
    isArchived: false,
    createdAt: '2025-01-01T00:00:00.000Z',
    createdBy: 'user-1',
    memberCount: 3,
    taskCount: 5,
    columnCount: 3,
  };

  const mockBoard: Board = {
    id: 'board-1',
    name: 'Test Board',
    description: 'Test description',
    isArchived: false,
    createdAt: '2025-01-01T00:00:00.000Z',
    createdBy: 'user-1',
  };

  const mockBoardMember: BoardMember = {
    id: 'member-1',
    userId: 'user-1',
    boardId: 'board-1',
    role: BoardRole.Admin,
    joinedAt: '2025-01-01T00:00:00.000Z',
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

  describe('useBoards', () => {
    it('fetches all boards successfully', async () => {
      vi.mocked(boardsApi.getBoards).mockResolvedValue([mockBoardListDto]);

      const { result } = renderHookWithClient(() => useBoards());

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toHaveLength(1);
      expect(result.current.data?.[0]).toEqual(mockBoardListDto);
      expect(boardsApi.getBoards).toHaveBeenCalled();
    });

    it('returns empty array when no boards found', async () => {
      vi.mocked(boardsApi.getBoards).mockResolvedValue([]);

      const { result } = renderHookWithClient(() => useBoards());

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([]);
    });

    it('handles fetch errors', async () => {
      const error = new Error('Network error');
      vi.mocked(boardsApi.getBoards).mockRejectedValue(error);

      const { result } = renderHookWithClient(() => useBoards());

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeTruthy();
    });
  });

  describe('useBoard', () => {
    it('fetches a single board successfully', async () => {
      vi.mocked(boardsApi.getBoard).mockResolvedValue(mockBoard);

      const { result } = renderHookWithClient(() => useBoard('board-1'));

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockBoard);
      expect(boardsApi.getBoard).toHaveBeenCalledWith('board-1');
    });

    it('handles fetch errors', async () => {
      const error = new Error('Board not found');
      vi.mocked(boardsApi.getBoard).mockRejectedValue(error);

      const { result } = renderHookWithClient(() => useBoard('board-1'));

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeTruthy();
    });
  });

  describe('useBoardMembers', () => {
    it('fetches board members successfully', async () => {
      vi.mocked(boardsApi.getBoardMembers).mockResolvedValue([mockBoardMember]);

      const { result } = renderHookWithClient(() => useBoardMembers('board-1'));

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toHaveLength(1);
      expect(result.current.data?.[0]).toEqual(mockBoardMember);
      expect(boardsApi.getBoardMembers).toHaveBeenCalledWith('board-1');
    });

    it('returns empty array when no members found', async () => {
      vi.mocked(boardsApi.getBoardMembers).mockResolvedValue([]);

      const { result } = renderHookWithClient(() => useBoardMembers('board-1'));

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([]);
    });
  });

  describe('useCreateBoard', () => {
    it('creates a board successfully', async () => {
      const newBoard: CreateBoardRequest = {
        name: 'New Board',
        description: 'New board description',
      };

      vi.mocked(boardsApi.createBoard).mockResolvedValue(mockBoard);

      const { result } = renderHookWithClient(() => useCreateBoard());

      await result.current.mutateAsync(newBoard);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(boardsApi.createBoard).toHaveBeenCalledWith(newBoard);
      expect(result.current.data).toEqual(mockBoard);
    });

    it('handles creation errors', async () => {
      const newBoard: CreateBoardRequest = {
        name: 'New Board',
        description: 'New board description',
      };

      const error = new Error('Creation failed');
      vi.mocked(boardsApi.createBoard).mockRejectedValue(error);

      const { result } = renderHookWithClient(() => useCreateBoard());

      await expect(result.current.mutateAsync(newBoard)).rejects.toThrow('Creation failed');
    });
  });

  describe('useUpdateBoard', () => {
    it('updates a board successfully', async () => {
      const updateData: UpdateBoardRequest = {
        id: 'board-1',
        name: 'Updated Board',
        description: 'Updated description',
      };

      const updatedBoard = { ...mockBoard, ...updateData };
      vi.mocked(boardsApi.updateBoard).mockResolvedValue(updatedBoard);

      const { result } = renderHookWithClient(() => useUpdateBoard());

      await result.current.mutateAsync({ id: 'board-1', data: updateData });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(boardsApi.updateBoard).toHaveBeenCalledWith('board-1', updateData);
      expect(result.current.data).toEqual(updatedBoard);
    });

    it('handles update errors', async () => {
      const updateData: UpdateBoardRequest = { id: 'board-1', name: 'Updated Board' };
      const error = new Error('Update failed');
      vi.mocked(boardsApi.updateBoard).mockRejectedValue(error);

      const { result } = renderHookWithClient(() => useUpdateBoard());

      await expect(
        result.current.mutateAsync({ id: 'board-1', data: updateData })
      ).rejects.toThrow('Update failed');
    });
  });

  describe('useDeleteBoard', () => {
    it('deletes a board successfully', async () => {
      vi.mocked(boardsApi.deleteBoard).mockResolvedValue(undefined);

      const { result } = renderHookWithClient(() => useDeleteBoard());

      await result.current.mutateAsync('board-1');

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(boardsApi.deleteBoard).toHaveBeenCalledWith('board-1');
    });

    it('handles deletion errors', async () => {
      const error = new Error('Deletion failed');
      vi.mocked(boardsApi.deleteBoard).mockRejectedValue(error);

      const { result } = renderHookWithClient(() => useDeleteBoard());

      await expect(result.current.mutateAsync('board-1')).rejects.toThrow('Deletion failed');
    });
  });
});
