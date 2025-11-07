namespace Kanbanium.Data.Entities;

public class TaskLabel
{
    public Guid TaskId { get; set; }
    public Guid LabelId { get; set; }
    public DateTime CreatedAt { get; set; }

    // Navigation properties
    public TaskItem Task { get; set; } = null!;
    public Label Label { get; set; } = null!;
}
