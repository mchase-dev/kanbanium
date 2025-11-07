namespace Kanbanium.Data.Entities;

public class SubTask : BaseAuditableEntity
{
    public Guid TaskId { get; set; }
    public string Title { get; set; } = string.Empty;
    public bool IsCompleted { get; set; }
    public int Position { get; set; }

    // Navigation properties
    public TaskItem Task { get; set; } = null!;
}
