// API Response wrapper
export interface Result<T = void> {
  isSuccess: boolean
  data?: T
  errors?: string[]
}

// Enums
export const BoardRole = {
  Viewer: 0,
  Member: 1,
  Admin: 2,
} as const

export type BoardRole = typeof BoardRole[keyof typeof BoardRole]

export const Priority = {
  Low: 0,
  Medium: 1,
  High: 2,
  Critical: 3,
} as const

export type Priority = typeof Priority[keyof typeof Priority]

export const SprintStatus = {
  Planned: 0,
  Active: 1,
  Completed: 2,
} as const

export type SprintStatus = typeof SprintStatus[keyof typeof SprintStatus]

export const StatusCategory = {
  ToDo: 0,
  InProgress: 1,
  Done: 2,
} as const

export type StatusCategory = typeof StatusCategory[keyof typeof StatusCategory]

// User
export interface User {
  id: string
  userName: string
  email: string
  firstName: string
  lastName: string
  avatarUrl?: string
  role?: string
  isDeleted: boolean
  lastLoginAt?: string
  createdAt: string
}

// Auth
export interface LoginRequest {
  email: string // Can be email or username - backend accepts both
  password: string
}

export interface RegisterRequest {
  userName: string
  email: string
  password: string
  firstName: string
  lastName: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: User
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface UpdateProfileRequest {
  firstName: string
  lastName: string
  email: string
}

// Board
export interface Board {
  id: string
  name: string
  description?: string
  isArchived: boolean
  createdAt: string
  createdBy: string
}

export interface BoardListDto extends Board {
  memberCount: number
  taskCount: number
  columnCount: number
}

export interface BoardDto extends Board {
  columns: BoardColumn[]
  members: BoardMember[]
}

export interface BoardColumn {
  id: string
  name: string
  position: number
  wipLimit?: number
  boardId: string
}

export interface BoardMember {
  id: string
  userId: string
  boardId: string
  role: BoardRole
  user: User
  joinedAt: string
}

// Task
export interface TaskListDto {
  id: string
  title: string
  boardId: string
  columnId: string
  statusId: string
  typeId: string
  sprintId?: string
  assigneeId?: string
  positionIndex: number
  priority: Priority
  dueDate?: string
  isArchived: boolean
  status: Status
  type: TaskType
  assignee?: User
  labels: TaskLabel[]
  subTaskCount: number
  completedSubTaskCount: number
  createdAt: string
}

export interface TaskDto extends TaskListDto {
  description?: string
  commentCount: number
  attachmentCount: number
  subTasks: SubTask[]
  watchers: Watcher[]
}

export interface Watcher {
  userId: string
  createdAt: string
  user: User
}

export interface Status {
  id: string
  name: string
  category: StatusCategory
  color: string
}

export interface TaskType {
  id: string
  name: string
  icon: string
  color: string
}

// Sprint
export interface SprintDto {
  id: string
  name: string
  goal?: string
  boardId: string
  startDate: string
  endDate: string
  status: SprintStatus
  taskCount?: number
  createdAt: string
}

// Label
export interface Label {
  id: string
  name: string
  color: string
  boardId: string
}

export interface TaskLabel {
  taskId: string
  labelId: string
  label: Label
}

// Alias for backward compatibility with backend
export type LabelDto = Label

// Comment
export interface CommentDto {
  id: string
  content: string
  taskId: string
  userId: string
  user: User
  createdAt: string
  updatedAt?: string
}

// Attachment
export interface AttachmentDto {
  id: string
  taskId: string
  fileName: string
  filePath: string
  fileSize: number
  contentType: string
  uploadedBy: string
  uploadedAt: string
}

// SubTask
export interface SubTask {
  id: string
  title: string
  isCompleted: boolean
  positionIndex: number
  taskId: string
  createdAt: string
}

// Task History
export interface TaskHistoryDto {
  id: string
  taskId: string
  userId: string
  action: string
  fieldName?: string
  oldValue?: string
  newValue?: string
  createdAt: string
  user: User
}

// Status DTO
export interface StatusDto {
  id: string
  name: string
  category: StatusCategory
  color: string
}

// TaskType DTO
export interface TaskTypeDto {
  id: string
  name: string
  icon: string
  color: string
}

// Request types for creating/updating

export interface CreateBoardRequest {
  name: string
  description?: string
}

export interface UpdateBoardRequest {
  id: string
  name: string
  description?: string
}

export interface CreateTaskRequest {
  boardId: string
  columnId: string
  title: string
  description?: string
  statusId: string
  typeId: string
  sprintId?: string
  assigneeId?: string
  priority: Priority
  dueDate?: string
}

export interface UpdateTaskRequest {
  title: string
  description?: string
  statusId: string
  typeId: string
  sprintId?: string
  assigneeId?: string
  priority: Priority
  dueDate?: string
}

export interface MoveTaskRequest {
  columnId: string
  positionIndex: number
}

export interface AssignTaskRequest {
  assigneeId?: string
}

export interface CreateSprintRequest {
  boardId: string
  name: string
  goal?: string
  startDate: string
  endDate: string
}

export interface UpdateSprintRequest {
  id: string
  name: string
  goal?: string
  startDate: string
  endDate: string
}

export interface CreateCommentRequest {
  taskId: string
  content: string
}

export interface UpdateCommentRequest {
  id: string
  content: string
}

export interface CreateSubTaskRequest {
  taskId: string
  title: string
}

export interface UpdateSubTaskRequest {
  id: string
  title: string
}

export interface CreateLabelRequest {
  boardId: string
  name: string
  color: string
}

export interface AddBoardMemberRequest {
  boardId: string
  userId: string
  role: BoardRole
}

export interface UpdateMemberRoleRequest {
  boardId: string
  userId: string
  role: BoardRole
}

export interface CreateColumnRequest {
  boardId: string
  name: string
  wipLimit?: number
}

export interface UpdateColumnRequest {
  id: string
  name: string
  wipLimit?: number
}

export interface ReorderColumnsRequest {
  boardId: string
  columnOrders: Array<{ columnId: string; position: number }>
}

// Search/Filter types
export interface SearchTasksParams {
  boardId: string
  searchTerm?: string
  statusId?: string
  typeId?: string
  assigneeId?: string
  priority?: Priority
  sprintId?: string
  isArchived?: boolean
  labelId?: string
}

// Type aliases for convenience
export type SearchTasksRequest = SearchTasksParams
export type ColumnDto = BoardColumn

// Pagination
export interface PaginatedList<T> {
  items: T[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

// User Management
export interface GetAllUsersParams {
  searchTerm?: string
  role?: string
  includeDeleted?: boolean
  page?: number
  pageSize?: number
}

export interface CreateUserRequest {
  userName: string
  email: string
  firstName: string
  lastName: string
  password: string
  role: string
}

export interface UpdateUserRequest {
  userId: string
  firstName?: string
  lastName?: string
  email?: string
  role?: string
}

// My Tasks
export interface MyTaskDto {
  id: string
  title: string
  boardId: string
  boardName: string
  columnId: string
  statusId: string
  typeId: string
  priority: Priority
  dueDate?: string
  createdAt: string
  isOverdue: boolean
  status: Status
  type: TaskType
  labels: TaskLabel[]
  subTaskCount: number
  completedSubTaskCount: number
}

export interface GetMyTasksParams {
  boardId?: string
  statusId?: string
  priority?: number
  isOverdue?: boolean
  sortBy?: string
}

// Activity Feed
export interface ActivityDto {
  id: string
  taskId: string
  taskTitle: string
  boardId: string
  boardName: string
  userId: string
  action: string
  fieldName?: string
  oldValue?: string
  newValue?: string
  createdAt: string
  user: User
}

export interface GetActivityParams {
  boardId?: string
  actionType?: string
  limit?: number
}
