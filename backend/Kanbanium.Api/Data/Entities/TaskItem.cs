namespace Kanbanium.Data.Entities;

public class TaskItem : BaseAuditableEntity
{
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
    public bool IsArchived { get; set; }

    // Navigation properties
    public Board Board { get; set; } = null!;
    public BoardColumn Column { get; set; } = null!;
    public Status Status { get; set; } = null!;
    public TaskType Type { get; set; } = null!;
    public Sprint? Sprint { get; set; }
    public ApplicationUser? Assignee { get; set; }
    public ICollection<TaskLabel> Labels { get; set; } = new List<TaskLabel>();
    public ICollection<Comment> Comments { get; set; } = new List<Comment>();
    public ICollection<Attachment> Attachments { get; set; } = new List<Attachment>();
    public ICollection<SubTask> SubTasks { get; set; } = new List<SubTask>();
    public ICollection<TaskHistory> History { get; set; } = new List<TaskHistory>();
    public ICollection<TaskWatcher> Watchers { get; set; } = new List<TaskWatcher>();
}
