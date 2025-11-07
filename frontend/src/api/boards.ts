import { apiClient } from '../lib/api-client'
import type {
  Board,
  BoardListDto,
  CreateBoardRequest,
  UpdateBoardRequest,
  BoardColumn,
  CreateColumnRequest,
  UpdateColumnRequest,
  ReorderColumnsRequest,
  BoardMember,
  AddBoardMemberRequest,
  UpdateMemberRoleRequest,
  Result,
} from '../types/api'

export const boardsApi = {
  // Board CRUD
  getBoards: async (): Promise<BoardListDto[]> => {
    const response = await apiClient.get<Result<BoardListDto[]>>('/boards')
    return response.data.data!
  },

  getBoard: async (id: string): Promise<Board> => {
    const response = await apiClient.get<Result<Board>>(`/boards/${id}`)
    return response.data.data!
  },

  createBoard: async (data: CreateBoardRequest): Promise<Board> => {
    const response = await apiClient.post<Result<Board>>('/boards', data)
    return response.data.data!
  },

  updateBoard: async (id: string, data: UpdateBoardRequest): Promise<Board> => {
    const response = await apiClient.put<Result<Board>>(`/boards/${id}`, data)
    return response.data.data!
  },

  deleteBoard: async (id: string): Promise<void> => {
    await apiClient.delete(`/boards/${id}`)
  },

  archiveBoard: async (id: string): Promise<void> => {
    await apiClient.post(`/boards/${id}/archive`)
  },

  unarchiveBoard: async (id: string): Promise<void> => {
    await apiClient.post(`/boards/${id}/unarchive`)
  },

  // Column Management
  createColumn: async (boardId: string, data: CreateColumnRequest): Promise<BoardColumn> => {
    const response = await apiClient.post<Result<BoardColumn>>(
      `/boards/${boardId}/columns`,
      data
    )
    return response.data.data!
  },

  updateColumn: async (
    boardId: string,
    columnId: string,
    data: UpdateColumnRequest
  ): Promise<BoardColumn> => {
    const response = await apiClient.put<Result<BoardColumn>>(
      `/boards/${boardId}/columns/${columnId}`,
      data
    )
    return response.data.data!
  },

  deleteColumn: async (boardId: string, columnId: string): Promise<void> => {
    await apiClient.delete(`/boards/${boardId}/columns/${columnId}`)
  },

  reorderColumns: async (boardId: string, data: ReorderColumnsRequest): Promise<void> => {
    await apiClient.post(`/boards/${boardId}/columns/reorder`, data)
  },

  // Board Members
  getBoardMembers: async (boardId: string): Promise<BoardMember[]> => {
    const response = await apiClient.get<Result<BoardMember[]>>(`/boards/${boardId}/members`)
    return response.data.data!
  },

  addBoardMember: async (
    boardId: string,
    data: AddBoardMemberRequest
  ): Promise<BoardMember> => {
    const response = await apiClient.post<Result<BoardMember>>(
      `/boards/${boardId}/members`,
      data
    )
    return response.data.data!
  },

  removeBoardMember: async (boardId: string, userId: string): Promise<void> => {
    await apiClient.delete(`/boards/${boardId}/members/${userId}`)
  },

  updateMemberRole: async (
    boardId: string,
    userId: string,
    data: UpdateMemberRoleRequest
  ): Promise<BoardMember> => {
    const response = await apiClient.put<Result<BoardMember>>(
      `/boards/${boardId}/members/${userId}/role`,
      data
    )
    return response.data.data!
  },
}
