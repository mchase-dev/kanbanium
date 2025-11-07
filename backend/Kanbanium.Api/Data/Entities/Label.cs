namespace Kanbanium.Data.Entities;

public class Label : BaseAuditableEntity
{
    public string Name { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public Guid? BoardId { get; set; }

    // Navigation properties
    public Board? Board { get; set; }
    public ICollection<TaskLabel> TaskLabels { get; set; } = new List<TaskLabel>();
}
