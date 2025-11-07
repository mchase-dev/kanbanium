namespace Kanbanium.Data.Entities;

public class TaskHistory
{
    public Guid Id { get; set; }
    public Guid TaskId { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public string? OldValue { get; set; }
    public string? NewValue { get; set; }
    public string? FieldName { get; set; }
    public DateTime CreatedAt { get; set; }

    // Navigation properties
    public TaskItem Task { get; set; } = null!;
    public ApplicationUser User { get; set; } = null!;
}
