namespace Kanbanium.Data.Entities;

public class BoardColumn : BaseAuditableEntity
{
    public Guid BoardId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Position { get; set; }
    public Guid? StatusId { get; set; }
    public int? WipLimit { get; set; }

    // Navigation properties
    public Board Board { get; set; } = null!;
    public Status? Status { get; set; }
    public ICollection<TaskItem> Tasks { get; set; } = new List<TaskItem>();
}
