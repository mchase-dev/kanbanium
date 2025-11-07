# Kanbanium Developer Guide

This guide will help you set up your development environment and understand the codebase

## Table of Contents

1. [Development Environment Setup](#development-environment-setup)
2. [Backend Development](#backend-development)
3. [Frontend Development](#frontend-development)
4. [Testing](#testing)
5. [Code Style and Conventions](#code-style-and-conventions)
6. [Git Workflow](#git-workflow)
7. [Common Tasks](#common-tasks)
8. [Troubleshooting](#troubleshooting)

---

## Development Environment Setup

### Prerequisites

Install the following tools:

1. **.NET 8 SDK**
   Download from: https://dotnet.microsoft.com/download/dotnet/8.0
   ```bash
   dotnet --version  # Should show 8.0.x
   ```

2. **Node.js 20+**
   Download from: https://nodejs.org/
   ```bash
   node --version   # Should show v20.x.x
   npm --version    # Should show 10.x.x
   ```

3. **Git**
   Download from: https://git-scm.com/

4. **Code Editor**
   - **VS Code** (recommended for frontend): https://code.visualstudio.com/
   - **Visual Studio 2022** or **Rider** (recommended for backend)

5. **Database** (choose one for local development):
   - **SQLite** (easiest - no installation needed)
   - **PostgreSQL** (recommended for production-like environment)
   - **SQL Server** or **MySQL** (optional)

### IDE Extensions (VS Code)

Install these extensions for the best experience:

**Backend**:
- C# Dev Kit (Microsoft)
- C# (Microsoft)

**Frontend**:
- ESLint
- Prettier - Code formatter
- TypeScript Vue Plugin (Volar)
- Tailwind CSS IntelliSense
- Auto Rename Tag

**General**:
- GitLens
- Docker (if using Docker)

### Initial Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/mchase-dev/kanbanium.git
   cd kanbanium
   ```

2. **Backend setup**:
   ```bash
   cd backend/Kanbanium.Api

   # Restore NuGet packages
   dotnet restore

   # Update appsettings.Development.json with your database connection
   # For SQLite (easiest):
   # "ConnectionStrings": {
   #   "DefaultConnection": "Data Source=kanbanium.db"
   # },
   # "Database": {
   #   "Provider": "Sqlite"
   # }

   # Run migrations
   dotnet ef database update

   # Run the application
   dotnet run
   ```

   Backend will start on https://localhost:7138 (HTTPS) or http://localhost:5124 (HTTP)

3. **Frontend setup**:
   ```bash
   cd frontend

   # Install dependencies
   npm install

   # Create .env file
   echo "VITE_API_URL=http://localhost:5124/api" > .env

   # Start dev server
   npm run dev
   ```

   Frontend will start on http://localhost:5173

4. **Verify setup**:
   - Open http://localhost:5173 in your browser
   - You should see the login page
   - Default credentials: `superuser@example.com` / `Superuser123!`

---

## Backend Development

### Adding a New Feature

Follow the CQRS pattern. Example: Adding "AssignTask" feature.

#### Step 1: Create Command

**Location**: `Domain/Tasks/Commands/AssignTask/`

```csharp
// AssignTaskCommand.cs
public class AssignTaskCommand : IRequest<Result>
{
    public string TaskId { get; set; } = string.Empty;
    public string? AssigneeId { get; set; }
}
```

#### Step 2: Create Validator

```csharp
// AssignTaskCommandValidator.cs
public class AssignTaskCommandValidator : AbstractValidator<AssignTaskCommand>
{
    public AssignTaskCommandValidator()
    {
        RuleFor(x => x.TaskId)
            .NotEmpty().WithMessage("Task ID is required");
    }
}
```

#### Step 3: Create Handler

```csharp
// AssignTaskCommandHandler.cs
public class AssignTaskCommandHandler : IRequestHandler<AssignTaskCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<AssignTaskCommandHandler> _logger;

    public AssignTaskCommandHandler(
        IApplicationDbContext context,
        ILogger<AssignTaskCommandHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result> Handle(AssignTaskCommand request, CancellationToken cancellationToken)
    {
        var task = await _context.Tasks
            .FirstOrDefaultAsync(t => t.Id == request.TaskId, cancellationToken);

        if (task == null)
            return Result.Failure(new[] { "Task not found" });

        task.AssigneeId = request.AssigneeId;
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Task {TaskId} assigned to {AssigneeId}",
            request.TaskId, request.AssigneeId);

        return Result.Success();
    }
}
```

#### Step 4: Add Controller Endpoint

```csharp
// TasksController.cs
[Authorize]
[HttpPost("{id}/assign")]
public async Task<IActionResult> AssignTask(string id, [FromBody] AssignTaskRequest request)
{
    var command = new AssignTaskCommand
    {
        TaskId = id,
        AssigneeId = request.AssigneeId
    };

    var result = await _mediator.Send(command);

    if (!result.IsSuccess)
        return BadRequest(Result.Failure(result.Errors));

    return Ok(result);
}
```

### Database Migrations

#### Creating a Migration

```bash
cd backend/Kanbanium.Api

# Add migration
dotnet ef migrations add AddSubTaskEntity

# Review generated migration in Data/Migrations/

# Apply migration
dotnet ef database update
```

#### Rolling Back

```bash
# List migrations
dotnet ef migrations list

# Rollback to specific migration
dotnet ef database update PreviousMigrationName

# Remove last migration (if not applied)
dotnet ef migrations remove
```

### Entity Framework Tips

**Always use async/await**:
```csharp
// Good
var task = await _context.Tasks.FirstOrDefaultAsync(t => t.Id == id);

// Bad
var task = _context.Tasks.FirstOrDefault(t => t.Id == id);
```

**Use Include for related data** (avoid N+1):
```csharp
// Good - Single query
var board = await _context.Boards
    .Include(b => b.Columns)
    .Include(b => b.Members)
    .FirstOrDefaultAsync(b => b.Id == id);

// Bad - Multiple queries (N+1 problem)
var board = await _context.Boards.FirstOrDefaultAsync(b => b.Id == id);
var columns = await _context.Columns.Where(c => c.BoardId == id).ToListAsync();
```

**Use AsNoTracking for read-only queries**:
```csharp
// Good - Faster for read-only
var tasks = await _context.Tasks
    .AsNoTracking()
    .Where(t => t.BoardId == boardId)
    .ToListAsync();
```

### Logging Best Practices

```csharp
// Good - Structured logging
_logger.LogInformation("Creating board {BoardName} for user {UserId}",
    boardName, userId);

// Bad - String interpolation
_logger.LogInformation($"Creating board {boardName} for user {userId}");
```

**Log Levels**:
- `LogDebug`: Detailed diagnostic info
- `LogInformation`: General flow of application
- `LogWarning`: Unexpected but handled (e.g., validation failure)
- `LogError`: Errors and exceptions
- `LogCritical`: System-critical failures

---

## Frontend Development

### Adding a New Page

#### Step 1: Create Page Component

**Location**: `src/pages/feature/FeaturePage.tsx`

```typescript
import { useState } from 'react';
import { Card } from 'antd';

export const FeaturePage = () => {
  const [data, setData] = useState(null);

  return (
    <div>
      <h1>Feature Page</h1>
      <Card>
        {/* Your content */}
      </Card>
    </div>
  );
};
```

#### Step 2: Add Route

**Location**: `src/App.tsx`

```typescript
<Route path="/feature" element={
  <ProtectedRoute>
    <DashboardLayout>
      <FeaturePage />
    </DashboardLayout>
  </ProtectedRoute>
} />
```

#### Step 3: Add Navigation Link

**Location**: `src/layouts/DashboardLayout.tsx`

```typescript
const menuItems = [
  // ... existing items
  {
    key: 'feature',
    icon: <FeatureIcon />,
    label: 'Feature',
    onClick: () => navigate('/feature'),
  },
];
```

### Adding an API Hook

#### Step 1: Create API Function

**Location**: `src/api/feature.ts`

```typescript
import { apiClient } from '../lib/api-client';
import type { FeatureDto, CreateFeatureRequest } from '../types/api';

export const featureApi = {
  getAll: () => apiClient.get<FeatureDto[]>('/feature'),

  getById: (id: string) => apiClient.get<FeatureDto>(`/feature/${id}`),

  create: (data: CreateFeatureRequest) =>
    apiClient.post<FeatureDto>('/feature', data),

  update: (id: string, data: Partial<FeatureDto>) =>
    apiClient.put<FeatureDto>(`/feature/${id}`, data),

  delete: (id: string) =>
    apiClient.delete(`/feature/${id}`),
};
```

#### Step 2: Create React Query Hook

**Location**: `src/hooks/useFeature.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { featureApi } from '../api/feature';
import type { CreateFeatureRequest } from '../types/api';

export const featureKeys = {
  all: ['features'] as const,
  detail: (id: string) => ['features', id] as const,
};

export const useFeatures = () => {
  return useQuery({
    queryKey: featureKeys.all,
    queryFn: async () => {
      const response = await featureApi.getAll();
      return response.data.data;
    },
  });
};

export const useCreateFeature = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFeatureRequest) => featureApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: featureKeys.all });
    },
  });
};
```

#### Step 3: Use in Component

```typescript
import { useFeatures, useCreateFeature } from '../hooks/useFeature';

export const FeaturePage = () => {
  const { data: features, isLoading } = useFeatures();
  const { mutate: createFeature } = useCreateFeature();

  const handleCreate = () => {
    createFeature({ name: 'New Feature' });
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {features?.map(feature => <div key={feature.id}>{feature.name}</div>)}
      <button onClick={handleCreate}>Create</button>
    </div>
  );
};
```

### TypeScript Tips

**Define types for API responses**:
```typescript
// types/api.ts
export interface FeatureDto {
  id: string;
  name: string;
  createdAt: string;
}

export interface CreateFeatureRequest {
  name: string;
  description?: string;
}
```

**Use proper typing for hooks**:
```typescript
// Good
const [value, setValue] = useState<string | null>(null);

// Bad (implicit any)
const [value, setValue] = useState(null);
```

### React Query Best Practices

**Use query keys consistently**:
```typescript
export const boardKeys = {
  all: ['boards'] as const,
  detail: (id: string) => ['boards', id] as const,
  members: (id: string) => ['boards', id, 'members'] as const,
};
```

**Implement optimistic updates**:
```typescript
export const useUpdateBoard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => boardsApi.update(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: boardKeys.detail(id) });

      // Snapshot current value
      const previous = queryClient.getQueryData(boardKeys.detail(id));

      // Optimistically update
      queryClient.setQueryData(boardKeys.detail(id), data);

      return { previous };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previous) {
        queryClient.setQueryData(
          boardKeys.detail(variables.id),
          context.previous
        );
      }
    },
    onSettled: (data, error, variables) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: boardKeys.detail(variables.id) });
    },
  });
};
```

---

## Testing

### Backend Unit Tests

**Location**: `backend/Kanbanium.Tests/`

#### Testing a Command Handler

```csharp
public class CreateBoardCommandHandlerTests
{
    private readonly Mock<IApplicationDbContext> _contextMock;
    private readonly Mock<ICurrentUserService> _currentUserMock;
    private readonly Mock<ILogger<CreateBoardCommandHandler>> _loggerMock;
    private readonly CreateBoardCommandHandler _handler;

    public CreateBoardCommandHandlerTests()
    {
        _contextMock = new Mock<IApplicationDbContext>();
        _currentUserMock = new Mock<ICurrentUserService>();
        _loggerMock = new Mock<ILogger<CreateBoardCommandHandler>>();

        // Setup DbSet mocks
        var boards = new List<Board>().AsQueryable().BuildMockDbSet();
        _contextMock.Setup(c => c.Boards).Returns(boards.Object);

        _handler = new CreateBoardCommandHandler(
            _contextMock.Object,
            _currentUserMock.Object,
            _loggerMock.Object
        );
    }

    [Fact]
    public async Task Handle_ValidRequest_ShouldCreateBoard()
    {
        // Arrange
        var command = new CreateBoardCommand
        {
            Name = "Test Board",
            Description = "Test Description"
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        _contextMock.Verify(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
```

#### Running Backend Tests

```bash
cd backend

# Run all tests
dotnet test

# Run with coverage
dotnet test /p:CollectCoverage=true

# Run specific test
dotnet test --filter "FullyQualifiedName~CreateBoardCommandHandlerTests"
```

### Frontend Unit Tests

**Location**: `src/**/*.test.tsx`

#### Testing a Component

```typescript
import { render, screen } from '@testing-library/react';
import { TaskCard } from './TaskCard';

describe('TaskCard', () => {
  it('should render task title', () => {
    const task = {
      id: '1',
      title: 'Test Task',
      priority: 1,
    };

    render(<TaskCard task={task} />);

    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });
});
```

#### Testing a Hook

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useBoards } from './useBoards';

describe('useBoards', () => {
  it('should fetch boards', async () => {
    const queryClient = new QueryClient();
    const wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );

    const { result } = renderHook(() => useBoards(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(3);
  });
});
```

#### Running Frontend Tests

```bash
cd frontend

# Run tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test TaskCard.test

# Run in watch mode
npm test -- --watch
```

---

## Code Style and Conventions

### Backend (C#)

**Naming Conventions**:
- Classes: `PascalCase` (e.g., `CreateBoardCommand`)
- Methods: `PascalCase` (e.g., `HandleAsync`)
- Private fields: `_camelCase` (e.g., `_context`)
- Parameters: `camelCase` (e.g., `boardId`)
- Constants: `PascalCase` (e.g., `MaxFileSize`)

**File Organization**:
- One class per file
- File name matches class name
- Group related files in folders

**Code Style**:
```csharp
// Good
public async Task<Result> Handle(CreateBoardCommand request, CancellationToken cancellationToken)
{
    var board = new Board
    {
        Name = request.Name,
        Description = request.Description
    };

    _context.Boards.Add(board);
    await _context.SaveChangesAsync(cancellationToken);

    return Result.Success();
}

// Use explicit typing
List<Board> boards = new List<Board>();

// Use var when type is obvious
var boards = await _context.Boards.ToListAsync();
```

### Frontend (TypeScript/React)

**Naming Conventions**:
- Components: `PascalCase` (e.g., `BoardCard`)
- Hooks: `camelCase` with `use` prefix (e.g., `useBoards`)
- Variables: `camelCase` (e.g., `boardId`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `MAX_FILE_SIZE`)
- Types/Interfaces: `PascalCase` (e.g., `BoardDto`)

**File Naming**:
- Components: `ComponentName.tsx`
- Hooks: `useHookName.ts`
- Types: `types.ts` or `api.ts`
- Tests: `ComponentName.test.tsx`

**Code Style**:
```typescript
// Good - Functional component with TypeScript
interface BoardCardProps {
  board: BoardDto;
  onClick: (id: string) => void;
}

export const BoardCard: React.FC<BoardCardProps> = ({ board, onClick }) => {
  const handleClick = () => {
    onClick(board.id);
  };

  return (
    <Card onClick={handleClick}>
      <h3>{board.name}</h3>
    </Card>
  );
};

// Use destructuring
const { data, isLoading, error } = useBoards();

// Use optional chaining
const taskCount = board?.tasks?.length ?? 0;
```

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): subject

body (optional)

footer (optional)
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting (no code change)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance

**Examples**:
```
feat(boards): add board archiving functionality

fix(tasks): correct drag-and-drop position calculation

docs(readme): update installation instructions

test(boards): add unit tests for board creation
```

---

## Git Workflow

### Branching Strategy

```
main
  ├── develop
  │   ├── feature/board-archiving
  │   ├── feature/task-comments
  │   └── bugfix/drag-drop-issue
  └── hotfix/critical-security-fix
```

**Branch Types**:
- `main`: Production-ready code
- `develop`: Integration branch
- `feature/*`: New features
- `bugfix/*`: Bug fixes
- `hotfix/*`: Critical production fixes

### Workflow

1. **Create feature branch**:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   ```

2. **Make changes and commit**:
   ```bash
   git add .
   git commit -m "feat(boards): add board archiving"
   ```

3. **Keep branch updated**:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout feature/your-feature-name
   git rebase develop
   ```

4. **Push and create PR**:
   ```bash
   git push origin feature/your-feature-name
   # Create pull request on GitHub
   ```

5. **After PR approval**:
   ```bash
   # Merge via GitHub UI
   # Delete branch locally
   git branch -d feature/your-feature-name
   ```

### Pull Request Guidelines

**PR Description Should Include**:
- What: Brief description of changes
- Why: Motivation for changes
- How: Implementation approach
- Testing: How to test changes
- Screenshots: If UI changes

**Example PR Template**:
```markdown
## What
Added board archiving functionality

## Why
Users requested ability to hide old boards without deleting

## How
- Added `isArchived` column to Boards table
- Created ArchiveBoardCommand and handler
- Added "Archive Board" button in UI

## Testing
1. Create a board
2. Click Settings → Archive Board
3. Verify board disappears from dashboard
4. Check "Show Archived" to see it again

## Screenshots
[Attach screenshot]
```

---

## Common Tasks

### Adding a New Entity

1. **Create entity class** in `Data/Entities/`
2. **Create configuration** in `Data/Configurations/`
3. **Add DbSet** to `ApplicationDbContext`
4. **Create migration**: `dotnet ef migrations add AddYourEntity`
5. **Update database**: `dotnet ef database update`

### Adding Real-Time Notification

1. **Add method to `INotificationService`**
2. **Implement in `NotificationService`**
3. **Call from command handler**:
   ```csharp
   await _notificationService.TaskCreated(task.BoardId, taskDto);
   ```
4. **Listen in frontend**:
   ```typescript
   signalrService.on('TaskCreated', (data) => {
     queryClient.invalidateQueries({ queryKey: ['tasks'] });
   });
   ```

### Adding a Filter

1. **Backend**: Add parameter to query
   ```csharp
   public class SearchTasksQuery : IRequest<Result<List<TaskDto>>>
   {
       public string? NewFilterField { get; set; }
   }
   ```

2. **Handler**: Apply filter
   ```csharp
   if (!string.IsNullOrEmpty(request.NewFilterField))
       query = query.Where(t => t.SomeField == request.NewFilterField);
   ```

3. **Frontend**: Add filter UI and pass to API

---

## Troubleshooting

### Common Backend Issues

**Issue**: Migration fails with "table already exists"
```bash
# Solution: Reset database
dotnet ef database drop
dotnet ef database update
```

**Issue**: NuGet package restore fails
```bash
# Solution: Clear cache and restore
dotnet nuget locals all --clear
dotnet restore
```

**Issue**: Port already in use
```bash
# Solution: Change port in Properties/launchSettings.json
```

### Common Frontend Issues

**Issue**: `npm install` fails
```bash
# Solution: Delete and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Issue**: TypeScript errors after package update
```bash
# Solution: Clear cache
rm -rf node_modules/.cache
npm run build
```

**Issue**: Vite dev server won't start
```bash
# Solution: Kill process on port 5173
lsof -ti:5173 | xargs kill -9  # Mac/Linux
# or change port in vite.config.ts
```
