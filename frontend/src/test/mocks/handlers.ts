import { http, HttpResponse } from 'msw';
import type { TaskDto, BoardDto, Status, TaskType } from '../../types/api';

// Mock data
const mockStatuses: Status[] = [
  { id: 'status-1', name: 'To Do', category: 0, color: '#94A3B8' },
  { id: 'status-2', name: 'In Progress', category: 1, color: '#3B82F6' },
  { id: 'status-3', name: 'Done', category: 2, color: '#10B981' },
];

const mockTaskTypes: TaskType[] = [
  { id: 'type-1', name: 'Task', icon: '📋', color: '#3B82F6' },
  { id: 'type-2', name: 'Bug', icon: '🐛', color: '#EF4444' },
  { id: 'type-3', name: 'Feature', icon: '✨', color: '#8B5CF6' },
];

const mockTask: TaskDto = {
  id: 'task-1',
  title: 'Test Task',
  description: 'Test description',
  boardId: 'board-1',
  columnId: 'column-1',
  statusId: 'status-2',
  typeId: 'type-1',
  positionIndex: 0,
  priority: 1,
  isArchived: false,
  createdAt: '2025-01-01T00:00:00.000Z',
  status: mockStatuses[1],
  type: mockTaskTypes[0],
  labels: [],
  subTasks: [],
  watchers: [],
  commentCount: 0,
  attachmentCount: 0,
  subTaskCount: 0,
  completedSubTaskCount: 0,
};

const mockBoard: BoardDto = {
  id: 'board-1',
  name: 'Test Board',
  description: 'Test board description',
  isArchived: false,
  createdAt: '2025-01-01T00:00:00.000Z',
  createdBy: 'user-1',
  columns: [
    {
      id: 'column-1',
      name: 'To Do',
      boardId: 'board-1',
      position: 0,
      wipLimit: undefined,
    },
    {
      id: 'column-2',
      name: 'In Progress',
      boardId: 'board-1',
      position: 1,
      wipLimit: 3,
    },
    {
      id: 'column-3',
      name: 'Done',
      boardId: 'board-1',
      position: 2,
      wipLimit: undefined,
    },
  ],
  members: [],
};

export const handlers = [
  // Reference Data
  http.get('http://localhost:5124/api/referencedata/statuses', () => {
    return HttpResponse.json({
      success: true,
      data: mockStatuses,
    });
  }),

  http.get('http://localhost:5124/api/referencedata/task-types', () => {
    return HttpResponse.json({
      success: true,
      data: mockTaskTypes,
    });
  }),

  // Tasks
  http.get('http://localhost:5124/api/tasks/:id', ({ params }) => {
    const { id } = params;
    return HttpResponse.json({
      success: true,
      data: { ...mockTask, id: id as string },
    });
  }),

  http.get('http://localhost:5124/api/tasks/column/:columnId', () => {
    return HttpResponse.json({
      success: true,
      data: [mockTask],
    });
  }),

  http.post('http://localhost:5124/api/tasks', async ({ request }) => {
    const body = await request.json() as any;
    return HttpResponse.json({
      success: true,
      data: {
        ...mockTask,
        id: 'new-task-id',
        title: body.title,
        description: body.description,
      },
    }, { status: 201 });
  }),

  http.put('http://localhost:5124/api/tasks/:id', async ({ params, request }) => {
    const { id } = params;
    const body = await request.json() as any;
    return HttpResponse.json({
      success: true,
      data: {
        ...mockTask,
        id: id as string,
        ...body,
      },
    });
  }),

  http.delete('http://localhost:5124/api/tasks/:id', () => {
    return HttpResponse.json({
      success: true,
      data: null,
    });
  }),

  // Boards
  http.get('http://localhost:5124/api/boards', () => {
    return HttpResponse.json({
      success: true,
      data: [
        {
          id: 'board-1',
          name: 'Test Board',
          description: 'Test board description',
          isArchived: false,
          createdAt: '2025-01-01T00:00:00.000Z',
          memberCount: 3,
        },
      ],
    });
  }),

  http.get('http://localhost:5124/api/boards/:id', ({ params }) => {
    const { id } = params;
    return HttpResponse.json({
      success: true,
      data: { ...mockBoard, id: id as string },
    });
  }),

  http.post('http://localhost:5124/api/boards', async ({ request }) => {
    const body = await request.json() as any;
    return HttpResponse.json({
      success: true,
      data: {
        ...mockBoard,
        id: 'new-board-id',
        name: body.name,
        description: body.description,
      },
    }, { status: 201 });
  }),
];
