import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { boardsApi } from '../api/boards'
import type {
  CreateBoardRequest,
  UpdateBoardRequest,
  CreateColumnRequest,
  UpdateColumnRequest,
  ReorderColumnsRequest,
  AddBoardMemberRequest,
  UpdateMemberRoleRequest,
} from '../types/api'

// Query Keys
export const boardKeys = {
  all: ['boards'] as const,
  lists: () => [...boardKeys.all, 'list'] as const,
  list: () => [...boardKeys.lists()] as const,
  details: () => [...boardKeys.all, 'detail'] as const,
  detail: (id: string) => [...boardKeys.details(), id] as const,
  members: (boardId: string) => [...boardKeys.detail(boardId), 'members'] as const,
}

// Fetch all boards
export function useBoards() {
  return useQuery({
    queryKey: boardKeys.list(),
    queryFn: boardsApi.getBoards,
  })
}

// Fetch single board
export function useBoard(id: string) {
  return useQuery({
    queryKey: boardKeys.detail(id),
    queryFn: () => boardsApi.getBoard(id),
    enabled: !!id,
  })
}

// Fetch board members
export function useBoardMembers(boardId: string) {
  return useQuery({
    queryKey: boardKeys.members(boardId),
    queryFn: () => boardsApi.getBoardMembers(boardId),
    enabled: !!boardId,
  })
}

// Create board
export function useCreateBoard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateBoardRequest) => boardsApi.createBoard(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.lists() })
      toast.success('Board created successfully')
    },
  })
}

// Update board
export function useUpdateBoard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBoardRequest }) =>
      boardsApi.updateBoard(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: boardKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: boardKeys.lists() })
      toast.success('Board updated successfully')
    },
  })
}

// Delete board
export function useDeleteBoard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => boardsApi.deleteBoard(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.lists() })
      toast.success('Board deleted successfully')
    },
  })
}

// Archive board
export function useArchiveBoard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => boardsApi.archiveBoard(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: boardKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: boardKeys.lists() })
      toast.success('Board archived successfully')
    },
  })
}

// Unarchive board
export function useUnarchiveBoard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => boardsApi.unarchiveBoard(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: boardKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: boardKeys.lists() })
      toast.success('Board unarchived successfully')
    },
  })
}

// Create column
export function useCreateColumn() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ boardId, data }: { boardId: string; data: CreateColumnRequest }) =>
      boardsApi.createColumn(boardId, data),
    onSuccess: (_, { boardId }) => {
      queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) })
      toast.success('Column created successfully')
    },
  })
}

// Update column
export function useUpdateColumn() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      boardId,
      columnId,
      data,
    }: {
      boardId: string
      columnId: string
      data: UpdateColumnRequest
    }) => boardsApi.updateColumn(boardId, columnId, data),
    onSuccess: (_, { boardId }) => {
      queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) })
      toast.success('Column updated successfully')
    },
  })
}

// Delete column
export function useDeleteColumn() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ boardId, columnId }: { boardId: string; columnId: string }) =>
      boardsApi.deleteColumn(boardId, columnId),
    onSuccess: (_, { boardId }) => {
      queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) })
      toast.success('Column deleted successfully')
    },
  })
}

// Reorder columns
export function useReorderColumns() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ boardId, data }: { boardId: string; data: ReorderColumnsRequest }) =>
      boardsApi.reorderColumns(boardId, data),
    onSuccess: (_, { boardId }) => {
      queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) })
    },
  })
}

// Add board member
export function useAddBoardMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ boardId, data }: { boardId: string; data: AddBoardMemberRequest }) =>
      boardsApi.addBoardMember(boardId, data),
    onSuccess: (_, { boardId }) => {
      queryClient.invalidateQueries({ queryKey: boardKeys.members(boardId) })
      toast.success('Member added successfully')
    },
  })
}

// Remove board member
export function useRemoveBoardMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ boardId, userId }: { boardId: string; userId: string }) =>
      boardsApi.removeBoardMember(boardId, userId),
    onSuccess: (_, { boardId }) => {
      queryClient.invalidateQueries({ queryKey: boardKeys.members(boardId) })
      toast.success('Member removed successfully')
    },
  })
}

// Update member role
export function useUpdateMemberRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      boardId,
      userId,
      data,
    }: {
      boardId: string
      userId: string
      data: UpdateMemberRoleRequest
    }) => boardsApi.updateMemberRole(boardId, userId, data),
    onSuccess: (_, { boardId }) => {
      queryClient.invalidateQueries({ queryKey: boardKeys.members(boardId) })
      toast.success('Member role updated successfully')
    },
  })
}
