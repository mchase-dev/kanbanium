import { describe, it, expect, vi, beforeEach } from 'vitest';
import { waitFor } from '@testing-library/react';
import { renderHookWithClient } from '../test/hookTestUtils';
import {
  useSearchUsers,
  useGetAllUsers,
  useCreateUser,
  useUpdateUser,
  useDisableUser,
  useEnableUser,
} from './useUsers';
import { usersApi } from '../api/users';
import type { User, GetAllUsersParams, CreateUserRequest, UpdateUserRequest } from '../types/api';

// Mock the API module
vi.mock('../api/users');

// Mock Ant Design message
vi.mock('antd', async () => {
  const actual = await vi.importActual('antd') as any;
  return {
    ...actual,
    message: {
      success: vi.fn(),
      error: vi.fn(),
    },
  };
});

describe('useUsers hooks', () => {
  const mockUser: User = {
    id: 'user-1',
    userName: 'johndoe',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    role: 'User',
    isDeleted: false,
    createdAt: '2025-01-01T00:00:00.000Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useSearchUsers', () => {
    it('searches users successfully', async () => {
      vi.mocked(usersApi.searchUsers).mockResolvedValue([mockUser]);

      const { result } = renderHookWithClient(() => useSearchUsers('john'));

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toHaveLength(1);
      expect(result.current.data?.[0]).toEqual(mockUser);
      expect(usersApi.searchUsers).toHaveBeenCalledWith('john');
    });

    it('returns empty array when no users found', async () => {
      vi.mocked(usersApi.searchUsers).mockResolvedValue([]);

      const { result } = renderHookWithClient(() => useSearchUsers('nonexistent'));

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([]);
    });

    it('does not search when term is less than 2 characters', () => {
      const { result } = renderHookWithClient(() => useSearchUsers('j'));

      expect(result.current.isFetching).toBe(false);
      expect(usersApi.searchUsers).not.toHaveBeenCalled();
    });

    it('does not search when term is undefined', () => {
      const { result } = renderHookWithClient(() => useSearchUsers(undefined));

      expect(result.current.isFetching).toBe(false);
      expect(usersApi.searchUsers).not.toHaveBeenCalled();
    });

    it('handles search errors', async () => {
      const error = new Error('Search failed');
      vi.mocked(usersApi.searchUsers).mockRejectedValue(error);

      const { result } = renderHookWithClient(() => useSearchUsers('john'));

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeTruthy();
    });
  });

  describe('useGetAllUsers', () => {
    it('fetches all users successfully', async () => {
      const paginatedResponse = {
        items: [mockUser],
        totalCount: 1,
        page: 1,
        pageSize: 10,
        totalPages: 1,
        hasPreviousPage: false,
        hasNextPage: false,
      };
      vi.mocked(usersApi.getAllUsers).mockResolvedValue(paginatedResponse);

      const { result } = renderHookWithClient(() => useGetAllUsers());

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.items).toHaveLength(1);
      expect(result.current.data?.items[0]).toEqual(mockUser);
      expect(usersApi.getAllUsers).toHaveBeenCalled();
    });

    it('fetches users with filters', async () => {
      const params: GetAllUsersParams = { role: 'Admin', searchTerm: 'john' };
      const paginatedResponse = {
        items: [mockUser],
        totalCount: 1,
        page: 1,
        pageSize: 10,
        totalPages: 1,
        hasPreviousPage: false,
        hasNextPage: false,
      };
      vi.mocked(usersApi.getAllUsers).mockResolvedValue(paginatedResponse);

      const { result } = renderHookWithClient(() => useGetAllUsers(params));

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(usersApi.getAllUsers).toHaveBeenCalledWith(params);
    });

    it('handles fetch errors', async () => {
      const error = new Error('Fetch failed');
      vi.mocked(usersApi.getAllUsers).mockRejectedValue(error);

      const { result } = renderHookWithClient(() => useGetAllUsers());

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeTruthy();
    });
  });

  describe('useCreateUser', () => {
    it('creates a user successfully', async () => {
      const newUser: CreateUserRequest = {
        userName: 'jsmith',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        password: 'Password123!',
        role: 'User',
      };

      const createdUser = { ...mockUser, ...newUser, id: 'user-2' };
      vi.mocked(usersApi.createUser).mockResolvedValue(createdUser);

      const { result } = renderHookWithClient(() => useCreateUser());

      await result.current.mutateAsync(newUser);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(usersApi.createUser).toHaveBeenCalledWith(newUser);
      expect(result.current.data).toEqual(createdUser);
    });

    it('handles creation errors', async () => {
      const newUser: CreateUserRequest = {
        userName: 'jsmith',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        password: 'Password123!',
        role: 'User',
      };

      const error = new Error('Creation failed');
      vi.mocked(usersApi.createUser).mockRejectedValue(error);

      const { result } = renderHookWithClient(() => useCreateUser());

      await expect(result.current.mutateAsync(newUser)).rejects.toThrow('Creation failed');
    });
  });

  describe('useUpdateUser', () => {
    it('updates a user successfully', async () => {
      const updateRequest: UpdateUserRequest = {
        userId: 'user-1',
        firstName: 'Johnny',
        lastName: 'Doe',
        role: 'Admin',
      };

      const updatedUser = { ...mockUser, firstName: 'Johnny', role: 'Admin' };
      vi.mocked(usersApi.updateUser).mockResolvedValue(updatedUser);

      const { result } = renderHookWithClient(() => useUpdateUser());

      await result.current.mutateAsync(updateRequest);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(usersApi.updateUser).toHaveBeenCalledWith('user-1', {
        firstName: 'Johnny',
        lastName: 'Doe',
        role: 'Admin',
      });
      expect(result.current.data).toEqual(updatedUser);
    });

    it('handles update errors', async () => {
      const updateRequest: UpdateUserRequest = {
        userId: 'user-1',
        firstName: 'Johnny',
      };

      const error = new Error('Update failed');
      vi.mocked(usersApi.updateUser).mockRejectedValue(error);

      const { result } = renderHookWithClient(() => useUpdateUser());

      await expect(result.current.mutateAsync(updateRequest)).rejects.toThrow('Update failed');
    });
  });

  describe('useDisableUser', () => {
    it('disables a user successfully', async () => {
      vi.mocked(usersApi.disableUser).mockResolvedValue(undefined);

      const { result } = renderHookWithClient(() => useDisableUser());

      await result.current.mutateAsync('user-1');

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(usersApi.disableUser).toHaveBeenCalledWith('user-1');
    });

    it('handles disable errors', async () => {
      const error = new Error('Disable failed');
      vi.mocked(usersApi.disableUser).mockRejectedValue(error);

      const { result } = renderHookWithClient(() => useDisableUser());

      await expect(result.current.mutateAsync('user-1')).rejects.toThrow('Disable failed');
    });
  });

  describe('useEnableUser', () => {
    it('enables a user successfully', async () => {
      vi.mocked(usersApi.enableUser).mockResolvedValue(undefined);

      const { result } = renderHookWithClient(() => useEnableUser());

      await result.current.mutateAsync('user-1');

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(usersApi.enableUser).toHaveBeenCalledWith('user-1');
    });

    it('handles enable errors', async () => {
      const error = new Error('Enable failed');
      vi.mocked(usersApi.enableUser).mockRejectedValue(error);

      const { result } = renderHookWithClient(() => useEnableUser());

      await expect(result.current.mutateAsync('user-1')).rejects.toThrow('Enable failed');
    });
  });
});
