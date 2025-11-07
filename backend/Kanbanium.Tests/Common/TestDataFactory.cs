using Kanbanium.Data.Entities;

namespace Kanbanium.Tests.Common;

public static class TestDataFactory
{
    public static ApplicationUser CreateUser(string? id = null, string? email = null, string? username = null)
    {
        var userId = id ?? Guid.NewGuid().ToString();
        return new ApplicationUser
        {
            Id = userId,
            Email = email ?? $"user{userId.Substring(0, 8)}@test.com",
            UserName = username ?? $"user{userId.Substring(0, 8)}",
            EmailConfirmed = true,
            FirstName = "Test",
            LastName = "User"
        };
    }

    public static Board CreateBoard(
        string name = "Test Board",
        string? description = "Test Description")
    {
        return new Board
        {
            Name = name,
            Description = description
        };
    }

    public static BoardColumn CreateColumn(
        Guid boardId,
        string name = "Test Column",
        int position = 0,
        int? wipLimit = null,
        Guid? statusId = null)
    {
        return new BoardColumn
        {
            BoardId = boardId,
            Name = name,
            Position = position,
            WipLimit = wipLimit,
            StatusId = statusId
        };
    }

    public static TaskItem CreateTask(
        Guid boardId,
        Guid columnId,
        Guid statusId,
        Guid typeId,
        string title = "Test Task",
        string? description = null,
        Priority priority = Priority.Medium,
        string? assigneeId = null)
    {
        return new TaskItem
        {
            BoardId = boardId,
            ColumnId = columnId,
            StatusId = statusId,
            TypeId = typeId,
            Title = title,
            Description = description,
            Priority = priority,
            AssigneeId = assigneeId,
            PositionIndex = 0
        };
    }

    public static Status CreateStatus(
        string name = "To Do",
        StatusCategory category = StatusCategory.ToDo,
        string color = "#808080",
        bool isGlobal = false)
    {
        return new Status
        {
            Name = name,
            Category = category,
            Color = color,
            IsGlobal = isGlobal
        };
    }

    public static TaskType CreateTaskType(
        string name = "Task",
        string icon = "task",
        string color = "#4A90E2")
    {
        return new TaskType
        {
            Name = name,
            Icon = icon,
            Color = color
        };
    }

    public static Sprint CreateSprint(
        Guid boardId,
        string name = "Sprint 1",
        DateTime? startDate = null,
        DateTime? endDate = null,
        SprintStatus status = SprintStatus.Planned,
        string? goal = null)
    {
        var start = startDate ?? DateTime.UtcNow;
        var end = endDate ?? DateTime.UtcNow.AddDays(14);

        return new Sprint
        {
            BoardId = boardId,
            Name = name,
            StartDate = start,
            EndDate = end,
            Status = status,
            Goal = goal
        };
    }

    public static Label CreateLabel(
        Guid? boardId = null,
        string name = "Test Label",
        string color = "#FF5733")
    {
        return new Label
        {
            BoardId = boardId,
            Name = name,
            Color = color
        };
    }

    public static Comment CreateComment(
        Guid taskId,
        string userId,
        string content = "Test comment",
        Guid? parentCommentId = null)
    {
        return new Comment
        {
            TaskId = taskId,
            UserId = userId,
            Content = content,
            ParentCommentId = parentCommentId
        };
    }

    public static SubTask CreateSubTask(
        Guid taskId,
        string title = "Test subtask",
        bool isCompleted = false,
        int position = 0)
    {
        return new SubTask
        {
            TaskId = taskId,
            Title = title,
            IsCompleted = isCompleted,
            Position = position
        };
    }

    public static BoardMember CreateBoardMember(
        Guid boardId,
        string userId,
        BoardRole role = BoardRole.Member,
        DateTime? joinedAt = null)
    {
        return new BoardMember
        {
            BoardId = boardId,
            UserId = userId,
            Role = role,
            JoinedAt = joinedAt ?? DateTime.UtcNow
        };
    }
}
