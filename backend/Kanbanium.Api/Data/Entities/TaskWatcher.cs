namespace Kanbanium.Data.Entities;

public class TaskWatcher
{
    public Guid TaskId { get; set; }
    public string UserId { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }

    // Navigation properties
    public TaskItem Task { get; set; } = null!;
    public ApplicationUser User { get; set; } = null!;
}
