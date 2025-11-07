using Kanbanium.Data.Entities;

namespace Kanbanium.DTOs;

public class TaskDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid BoardId { get; set; }
    public Guid ColumnId { get; set; }
    public Guid StatusId { get; set; }
    public Guid TypeId { get; set; }
    public Guid? SprintId { get; set; }
    public string? AssigneeId { get; set; }
    public int PositionIndex { get; set; }
    public Priority Priority { get; set; }
    public DateTime? DueDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    // Navigation properties
    public StatusDto Status { get; set; } = null!;
    public TaskTypeDto Type { get; set; } = null!;
    public UserDto? Assignee { get; set; }
    public List<TaskLabelDto> Labels { get; set; } = new();
    public List<SubTaskDto> SubTasks { get; set; } = new();
    public int CommentCount { get; set; }
    public int AttachmentCount { get; set; }
    public List<WatcherDto> Watchers { get; set; } = new();
}

public class TaskListDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public Guid ColumnId { get; set; }
    public Guid StatusId { get; set; }
    public Guid TypeId { get; set; }
    public string? AssigneeId { get; set; }
    public int PositionIndex { get; set; }
    public Priority Priority { get; set; }
    public DateTime? DueDate { get; set; }

    public StatusDto Status { get; set; } = null!;
    public TaskTypeDto Type { get; set; } = null!;
    public UserDto? Assignee { get; set; }
    public List<TaskLabelDto> Labels { get; set; } = new();
    public int SubTaskCount { get; set; }
    public int CompletedSubTaskCount { get; set; }
}

public class MyTaskDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public Guid BoardId { get; set; }
    public string BoardName { get; set; } = string.Empty;
    public Guid ColumnId { get; set; }
    public Guid StatusId { get; set; }
    public Guid TypeId { get; set; }
    public Priority Priority { get; set; }
    public DateTime? DueDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool IsOverdue { get; set; }

    public StatusDto Status { get; set; } = null!;
    public TaskTypeDto Type { get; set; } = null!;
    public List<TaskLabelDto> Labels { get; set; } = new();
    public int SubTaskCount { get; set; }
    public int CompletedSubTaskCount { get; set; }
}
