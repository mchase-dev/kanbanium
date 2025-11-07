namespace Kanbanium.Data.Entities;

public class Board : BaseAuditableEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? BackgroundColor { get; set; }
    public bool IsArchived { get; set; }

    // Navigation properties
    public ICollection<BoardMember> Members { get; set; } = new List<BoardMember>();
    public ICollection<BoardColumn> Columns { get; set; } = new List<BoardColumn>();
    public ICollection<Sprint> Sprints { get; set; } = new List<Sprint>();
    public ICollection<TaskItem> Tasks { get; set; } = new List<TaskItem>();
}
