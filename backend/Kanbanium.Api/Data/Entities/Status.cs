namespace Kanbanium.Data.Entities;

public class Status : BaseAuditableEntity
{
    public string Name { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public StatusCategory Category { get; set; }
    public bool IsGlobal { get; set; }

    // Navigation properties
    public ICollection<TaskItem> Tasks { get; set; } = new List<TaskItem>();
    public ICollection<BoardColumn> Columns { get; set; } = new List<BoardColumn>();
}
