namespace Kanbanium.Data.Entities;

public class Sprint : BaseAuditableEntity
{
    public string Name { get; set; } = string.Empty;
    public Guid BoardId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string? Goal { get; set; }
    public SprintStatus Status { get; set; }

    // Navigation properties
    public Board Board { get; set; } = null!;
    public ICollection<TaskItem> Tasks { get; set; } = new List<TaskItem>();
}
