using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Kanbanium.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace Kanbanium.Tests.Integration;

public class TaskIntegrationTests : IntegrationTestBase
{
    public TaskIntegrationTests(CustomWebApplicationFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task CreateTask_WithValidData_ReturnsSuccess()
    {
        // Arrange
        var token = await GetAuthTokenAsync();
        SetAuthToken(token);

        var user = await DbContext.Users.FirstAsync(u => u.Email == "test@example.com");
        var board = await CreateTestBoardAsync(user.Id, "Task Board");
        var column = await GetOrCreateBoardColumnAsync(board.Id, "To Do");
        var status = await GetOrCreateStatusAsync("To Do");
        var taskType = await GetOrCreateTaskTypeAsync("Task");

        var request = new
        {
            Title = "Implement new feature",
            Description = "This is a test task",
            BoardId = board.Id,
            ColumnId = column.Id,
            StatusId = status.Id,
            TypeId = taskType.Id,
            Priority = Priority.High
        };

        // Act
        var response = await Client.PostAsJsonAsync("/api/tasks", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var result = await response.Content.ReadFromJsonAsync<ResultWrapper<TaskDto>>(JsonOptions);
        result.Should().NotBeNull();
        result!.Data.Should().NotBeNull();
        result.Data!.Title.Should().Be(request.Title);
        result.Data.Description.Should().Be(request.Description);
        result.Data.Priority.Should().Be(request.Priority);
    }

    [Fact]
    public async Task CreateTask_WithoutBoardAccess_ReturnsForbidden()
    {
        // Arrange
        var ownerToken = await GetAuthTokenAsync("owner@example.com");
        var ownerUser = await DbContext.Users.FirstAsync(u => u.Email == "owner@example.com");
        var board = await CreateTestBoardAsync(ownerUser.Id, "Private Board");

        var otherUserToken = await GetAuthTokenAsync("other@example.com");
        SetAuthToken(otherUserToken);

        var column = await GetOrCreateBoardColumnAsync(board.Id, "To Do");
        var status = await GetOrCreateStatusAsync("To Do");
        var taskType = await GetOrCreateTaskTypeAsync("Task");

        var request = new
        {
            Title = "Unauthorized task",
            BoardId = board.Id,
            ColumnId = column.Id,
            StatusId = status.Id,
            TypeId = taskType.Id
        };

        // Act
        var response = await Client.PostAsJsonAsync("/api/tasks", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task GetTaskById_WithValidId_ReturnsTask()
    {
        // Arrange
        var token = await GetAuthTokenAsync();
        SetAuthToken(token);

        var user = await DbContext.Users.FirstAsync(u => u.Email == "test@example.com");
        var board = await CreateTestBoardAsync(user.Id, "Board");
        var status = await GetOrCreateStatusAsync("To Do");
        var taskType = await GetOrCreateTaskTypeAsync("Task");

        var task = new TaskItem
        {
            Title = "Test Task",
            Description = "Description",
            BoardId = board.Id,
            StatusId = status.Id,
            TypeId = taskType.Id,
            Priority = Priority.Medium,
            PositionIndex = 0,
            CreatedBy = user.Id,
            CreatedAt = DateTime.UtcNow
        };

        DbContext.Tasks.Add(task);
        await DbContext.SaveChangesAsync();

        // Act
        var response = await Client.GetAsync($"/api/tasks/{task.Id}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<ResultWrapper<TaskDto>>(JsonOptions);
        result.Should().NotBeNull();
        result!.Data.Should().NotBeNull();
        result.Data!.Id.Should().Be(task.Id);
        result.Data.Title.Should().Be(task.Title);
    }

    [Fact]
    public async Task UpdateTask_WithValidData_ReturnsSuccess()
    {
        // Arrange
        var token = await GetAuthTokenAsync();
        SetAuthToken(token);

        var user = await DbContext.Users.FirstAsync(u => u.Email == "test@example.com");
        var board = await CreateTestBoardAsync(user.Id, "Board");
        var status = await GetOrCreateStatusAsync("To Do");
        var taskType = await GetOrCreateTaskTypeAsync("Task");

        var task = new TaskItem
        {
            Title = "Original Title",
            BoardId = board.Id,
            StatusId = status.Id,
            TypeId = taskType.Id,
            Priority = Priority.Low,
            PositionIndex = 0,
            CreatedBy = user.Id,
            CreatedAt = DateTime.UtcNow
        };

        DbContext.Tasks.Add(task);
        await DbContext.SaveChangesAsync();

        var request = new
        {
            Title = "Updated Title",
            Description = "Updated Description",
            StatusId = status.Id,
            TypeId = taskType.Id,
            Priority = Priority.Critical
        };

        // Act
        var response = await Client.PutAsJsonAsync($"/api/tasks/{task.Id}", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<ResultWrapper<TaskDto>>(JsonOptions);
        result.Should().NotBeNull();
        result!.Data.Should().NotBeNull();
        result.Data!.Title.Should().Be(request.Title);
        result.Data.Description.Should().Be(request.Description);
        result.Data.Priority.Should().Be(request.Priority);
    }

    [Fact]
    public async Task DeleteTask_AsAdmin_ReturnsSuccess()
    {
        // Arrange
        var token = await GetAuthTokenAsync();
        SetAuthToken(token);

        var user = await DbContext.Users.FirstAsync(u => u.Email == "test@example.com");
        var board = await CreateTestBoardAsync(user.Id, "Board");
        var status = await GetOrCreateStatusAsync("To Do");
        var taskType = await GetOrCreateTaskTypeAsync("Task");

        var task = new TaskItem
        {
            Title = "Task to Delete",
            BoardId = board.Id,
            StatusId = status.Id,
            TypeId = taskType.Id,
            Priority = Priority.Medium,
            PositionIndex = 0,
            CreatedBy = user.Id,
            CreatedAt = DateTime.UtcNow
        };

        DbContext.Tasks.Add(task);
        await DbContext.SaveChangesAsync();

        // Act
        var response = await Client.DeleteAsync($"/api/tasks/{task.Id}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        // Verify soft delete - query with filters ignored to check soft delete
        DbContext.ChangeTracker.Clear();
        var deletedTask = await DbContext.Tasks
            .IgnoreQueryFilters()
            .AsNoTracking()
            .FirstOrDefaultAsync(t => t.Id == task.Id);
        deletedTask.Should().NotBeNull();
        deletedTask!.DeletedAt.Should().NotBeNull();
    }

    [Fact]
    public async Task MoveTask_WithValidData_ReturnsSuccess()
    {
        // Arrange
        var token = await GetAuthTokenAsync();
        SetAuthToken(token);

        var user = await DbContext.Users.FirstAsync(u => u.Email == "test@example.com");
        var board = await CreateTestBoardAsync(user.Id, "Board");
        var todoColumn = await GetOrCreateBoardColumnAsync(board.Id, "To Do");
        var inProgressColumn = await DbContext.BoardColumns.FirstOrDefaultAsync(c => c.BoardId == board.Id && c.Name == "In Progress");
        if (inProgressColumn == null)
        {
            inProgressColumn = new BoardColumn
            {
                BoardId = board.Id,
                Name = "In Progress",
                Position = 1,
                WipLimit = null
            };
            DbContext.BoardColumns.Add(inProgressColumn);
            await DbContext.SaveChangesAsync();
        }
        var status = await GetOrCreateStatusAsync("To Do");
        var taskType = await GetOrCreateTaskTypeAsync("Task");

        var task = new TaskItem
        {
            Title = "Task to Move",
            BoardId = board.Id,
            ColumnId = todoColumn.Id,
            StatusId = status.Id,
            TypeId = taskType.Id,
            Priority = Priority.Medium,
            PositionIndex = 0,
            CreatedBy = user.Id,
            CreatedAt = DateTime.UtcNow
        };

        DbContext.Tasks.Add(task);
        await DbContext.SaveChangesAsync();

        var request = new
        {
            ColumnId = inProgressColumn.Id,
            PositionIndex = 1
        };

        // Act
        var response = await Client.PostAsJsonAsync($"/api/tasks/{task.Id}/move", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<ResultWrapper<TaskDto>>(JsonOptions);
        result.Should().NotBeNull();
        result!.Data.Should().NotBeNull();
        result.Data!.PositionIndex.Should().Be(request.PositionIndex);
    }

    [Fact]
    public async Task ArchiveTask_AsAdmin_ReturnsSuccess()
    {
        // Arrange
        var token = await GetAuthTokenAsync();
        SetAuthToken(token);

        var user = await DbContext.Users.FirstAsync(u => u.Email == "test@example.com");
        var board = await CreateTestBoardAsync(user.Id, "Board");
        var status = await GetOrCreateStatusAsync("To Do");
        var taskType = await GetOrCreateTaskTypeAsync("Task");

        var task = new TaskItem
        {
            Title = "Task to Archive",
            BoardId = board.Id,
            StatusId = status.Id,
            TypeId = taskType.Id,
            Priority = Priority.Medium,
            PositionIndex = 0,
            IsArchived = false,
            CreatedBy = user.Id,
            CreatedAt = DateTime.UtcNow
        };

        DbContext.Tasks.Add(task);
        await DbContext.SaveChangesAsync();

        // Act
        var response = await Client.PostAsync($"/api/tasks/{task.Id}/archive", null);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        // Verify archived - clear tracker and re-query
        DbContext.ChangeTracker.Clear();
        var archivedTask = await DbContext.Tasks
            .AsNoTracking()
            .FirstOrDefaultAsync(t => t.Id == task.Id);
        archivedTask.Should().NotBeNull();
        archivedTask!.IsArchived.Should().BeTrue();
    }

    [Fact]
    public async Task AssignTask_WithValidUser_ReturnsSuccess()
    {
        // Arrange
        var token = await GetAuthTokenAsync();
        SetAuthToken(token);

        var user = await DbContext.Users.FirstAsync(u => u.Email == "test@example.com");
        var assignee = await CreateTestUserAsync("assignee@example.com");
        var board = await CreateTestBoardAsync(user.Id, "Board");

        // Add assignee as board member
        var boardMember = new BoardMember
        {
            BoardId = board.Id,
            UserId = assignee.Id,
            Role = BoardRole.Member,
            CreatedBy = user.Id,
            CreatedAt = DateTime.UtcNow
        };
        DbContext.BoardMembers.Add(boardMember);
        await DbContext.SaveChangesAsync();

        var status = await GetOrCreateStatusAsync("To Do");
        var taskType = await GetOrCreateTaskTypeAsync("Task");

        var task = new TaskItem
        {
            Title = "Task to Assign",
            BoardId = board.Id,
            StatusId = status.Id,
            TypeId = taskType.Id,
            Priority = Priority.Medium,
            PositionIndex = 0,
            CreatedBy = user.Id,
            CreatedAt = DateTime.UtcNow
        };

        DbContext.Tasks.Add(task);
        await DbContext.SaveChangesAsync();

        var request = new
        {
            AssigneeId = assignee.Id
        };

        // Act
        var response = await Client.PostAsJsonAsync($"/api/tasks/{task.Id}/assign", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<ResultWrapper<TaskDto>>(JsonOptions);
        result.Should().NotBeNull();
        result!.Data.Should().NotBeNull();
        result.Data!.AssigneeId.Should().Be(assignee.Id);
    }

    private class ResultWrapper<T>
    {
        public bool IsSuccess { get; set; }
        public T? Data { get; set; }
        public string[] Errors { get; set; } = Array.Empty<string>();
    }

    private class TaskDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public Guid BoardId { get; set; }
        public Guid StatusId { get; set; }
        public Guid TypeId { get; set; }
        public Priority Priority { get; set; }
        public int PositionIndex { get; set; }
        public string? AssigneeId { get; set; }
        public bool IsArchived { get; set; }
    }
}
